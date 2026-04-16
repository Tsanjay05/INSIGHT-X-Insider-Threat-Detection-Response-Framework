/**
 * Alerts API client
 */

import type {
    Alert,
    AlertDetail,
    AlertListResponse,
    AlertFilters,
    AlertComment,
    AlertSeverity,
    AlertStatus,
    AlertTimelineEvent,
} from './alerts.types';
import type { DecisionProvenance } from './provenance.types';
import { get, post } from './client';

const PROVENANCE_BASE_PATH = '/api/v1/provenance';
const AUDIT_BASE_PATH = '/api/v1/audit';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const nowIso = (): string => new Date().toISOString();

const toSeverity = (riskLevel?: string): AlertSeverity => {
    switch ((riskLevel || '').toUpperCase()) {
        case 'CRITICAL':
            return 'CRITICAL';
        case 'HIGH':
            return 'HIGH';
        case 'MEDIUM':
            return 'MEDIUM';
        case 'LOW':
            return 'LOW';
        default:
            return 'INFO';
    }
};

const toRiskLevelFilter = (severity?: AlertSeverity): string | undefined => {
    if (!severity || severity === 'INFO') return undefined;
    return severity;
};

const toStatus = (decision: DecisionProvenance): AlertStatus => {
    return decision.policyFallback ? 'ESCALATED' : 'NEW';
};

const toRiskScore = (decision: DecisionProvenance): number => {
    const trustDerived = clamp(Math.round(100 - decision.trustScore), 0, 100);
    const severity = toSeverity(decision.riskLevel);
    const floorBySeverity: Record<AlertSeverity, number> = {
        CRITICAL: 90,
        HIGH: 75,
        MEDIUM: 55,
        LOW: 30,
        INFO: 10,
    };

    return Math.max(trustDerived, floorBySeverity[severity]);
};

const toTimestamp = (decision: DecisionProvenance): string => {
    return decision.decisionTimestamp || decision.createdAt || nowIso();
};

const toAlert = (decision: DecisionProvenance): Alert => {
    const severity = toSeverity(decision.riskLevel);
    const timestamp = toTimestamp(decision);

    return {
        id: decision.decisionId,
        title: `${severity} risk decision for ${decision.entityId}`,
        description: `Trust score ${Math.round(decision.trustScore)} with confidence ${Math.round(decision.confidence * 100)}%.`,
        severity,
        status: toStatus(decision),
        source: 'Trust Engine',
        entityId: decision.entityId,
        entityType: 'USER',
        riskScore: toRiskScore(decision),
        createdAt: timestamp,
        updatedAt: decision.createdAt || timestamp,
    };
};

const extractExplanationText = (payload: Record<string, unknown> | null): string | null => {
    if (!payload) return null;

    const explanation = payload.explanation;
    if (typeof explanation === 'string' && explanation.trim().length > 0) {
        return explanation;
    }

    if (Array.isArray(explanation)) {
        const text = explanation.filter((item): item is string => typeof item === 'string').join(' ');
        if (text.trim().length > 0) {
            return text;
        }
    }

    if (typeof payload.summary === 'string' && payload.summary.trim().length > 0) {
        return payload.summary;
    }

    return null;
};

const getExplanation = async (decisionId: string): Promise<Record<string, unknown> | null> => {
    try {
        return await get<Record<string, unknown>>(`${PROVENANCE_BASE_PATH}/explain/decision/${decisionId}`);
    } catch {
        return null;
    }
};

const toAlertDetail = async (decision: DecisionProvenance): Promise<AlertDetail> => {
    const base = toAlert(decision);
    const explanationPayload = await getExplanation(decision.decisionId);
    const explanationText = extractExplanationText(explanationPayload);

    const timeline: AlertTimelineEvent[] = [
        {
            id: `${decision.decisionId}-created`,
            type: 'CREATED',
            description: 'Trust decision recorded in provenance ledger.',
            timestamp: base.createdAt,
        },
    ];

    if (decision.policyFallback) {
        timeline.push({
            id: `${decision.decisionId}-escalated`,
            type: 'ESCALATION',
            description: 'Decision was marked with policy fallback and escalated.',
            timestamp: base.updatedAt,
        });
    }

    const comments: AlertComment[] = [];
    if (explanationText) {
        comments.push({
            id: `${decision.decisionId}-explain`,
            alertId: decision.decisionId,
            author: 'Explainability Engine',
            content: explanationText,
            createdAt: base.updatedAt,
        });
    }

    return {
        ...base,
        rawEvent: {
            provenanceId: decision.provenanceId,
            policyId: decision.policyId,
            policyVersion: decision.policyVersion,
            policyHash: decision.policyHash,
            policyFallback: decision.policyFallback,
            isSimulation: decision.isSimulation,
            confidence: decision.confidence,
            explanation: explanationPayload,
        },
        relatedAlerts: [],
        relatedControls: decision.policyId ? [decision.policyId] : [],
        affectedResources: [decision.entityId],
        timeline,
        comments,
        tags: [
            'trust-decision',
            decision.riskLevel.toLowerCase(),
            decision.policyFallback ? 'policy-fallback' : 'policy-primary',
        ],
    };
};

export const getAlerts = async (filters?: AlertFilters): Promise<AlertListResponse> => {
    const decisions = await get<DecisionProvenance[]>(`${PROVENANCE_BASE_PATH}/decisions`, {
        entityId: filters?.entityId,
        riskLevel: toRiskLevelFilter(filters?.severity),
        startTime: filters?.dateFrom,
        endTime: filters?.dateTo,
    });

    let alerts = decisions.map(toAlert);

    if (filters?.search) {
        const search = filters.search.toLowerCase();
        alerts = alerts.filter((alert) =>
            alert.title.toLowerCase().includes(search)
            || alert.description.toLowerCase().includes(search)
            || alert.source.toLowerCase().includes(search)
            || alert.entityId.toLowerCase().includes(search)
        );
    }

    if (filters?.status) {
        alerts = alerts.filter((alert) => alert.status === filters.status);
    }

    if (filters?.source) {
        const source = filters.source.toLowerCase();
        alerts = alerts.filter((alert) => alert.source.toLowerCase().includes(source));
    }

    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const paginated = alerts.slice(start, start + pageSize);

    return {
        alerts: paginated,
        total: alerts.length,
        page,
        pageSize,
    };
};

export const getAlertById = async (id: string): Promise<AlertDetail> => {
    const decision = await get<DecisionProvenance>(`${PROVENANCE_BASE_PATH}/decisions/${id}`);
    return toAlertDetail(decision);
};

export const updateAlertStatus = async (id: string, status: AlertStatus): Promise<Alert> => {
    await post(`${AUDIT_BASE_PATH}/log`, {
        actor: 'frontend-user',
        action: 'ALERT_STATUS_UPDATE',
        resource: 'alert',
        resourceId: id,
        details: `Updated alert status to ${status}`,
        status: 'SUCCESS',
        metadata: { status },
    });

    const current = await getAlertById(id);
    const timestamp = nowIso();

    return {
        ...current,
        status,
        updatedAt: timestamp,
        acknowledgedAt: status === 'ACKNOWLEDGED' ? timestamp : current.acknowledgedAt,
        resolvedAt: status === 'RESOLVED' ? timestamp : current.resolvedAt,
    };
};

export const addAlertComment = async (id: string, content: string): Promise<AlertComment> => {
    await post(`${AUDIT_BASE_PATH}/log`, {
        actor: 'frontend-user',
        action: 'ALERT_COMMENT_ADD',
        resource: 'alert',
        resourceId: id,
        details: content,
        status: 'SUCCESS',
    });

    return {
        id: `comment-${Date.now()}`,
        alertId: id,
        author: 'Current Analyst',
        content,
        createdAt: nowIso(),
    };
};
