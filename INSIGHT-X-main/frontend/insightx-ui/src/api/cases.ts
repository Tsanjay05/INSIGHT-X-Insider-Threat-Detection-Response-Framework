/**
 * Cases API client
 */

import { get } from './client';
import type {
    Case,
    CaseDetail,
    CaseListResponse,
    CaseFilters,
    CaseComment,
    CaseStatus,
    CasePriority,
    CaseTimelineEvent,
    CaseEvidence,
} from './cases.types';
import type { DecisionProvenance } from './provenance.types';

const PROVENANCE_BASE_PATH = '/api/v1/provenance';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const nowIso = (): string => new Date().toISOString();

const toPriority = (riskLevel?: string): CasePriority => {
    switch ((riskLevel || '').toUpperCase()) {
        case 'CRITICAL':
            return 'CRITICAL';
        case 'HIGH':
            return 'HIGH';
        case 'MEDIUM':
            return 'MEDIUM';
        default:
            return 'LOW';
    }
};

const toStatus = (decision: DecisionProvenance): CaseStatus => {
    if (decision.policyFallback) return 'ESCALATED';

    const priority = toPriority(decision.riskLevel);
    if (priority === 'CRITICAL' || priority === 'HIGH') {
        return 'INVESTIGATING';
    }

    return 'OPEN';
};

const toRiskScore = (decision: DecisionProvenance): number => {
    const trustBasedRisk = Math.round(100 - decision.trustScore);
    return Math.max(0, Math.min(100, trustBasedRisk));
};

const toTimestamp = (decision: DecisionProvenance): string => {
    return decision.decisionTimestamp || decision.createdAt || nowIso();
};

const toSlaDeadline = (createdAt: string, priority: CasePriority): string => {
    const multiplier = priority === 'CRITICAL' ? 1 : priority === 'HIGH' ? 2 : priority === 'MEDIUM' ? 3 : 5;
    return new Date(new Date(createdAt).getTime() + (multiplier * MS_PER_DAY)).toISOString();
};

const toCase = (decision: DecisionProvenance): Case => {
    const createdAt = toTimestamp(decision);
    const priority = toPriority(decision.riskLevel);

    return {
        id: decision.decisionId,
        title: `${priority} priority investigation for ${decision.entityId}`,
        description: `Risk level ${decision.riskLevel} with trust score ${Math.round(decision.trustScore)} requires analyst review.`,
        status: toStatus(decision),
        priority,
        subject: decision.entityId,
        subjectEmail: decision.entityId.includes('@') ? decision.entityId : `${decision.entityId}@insightx.local`,
        alertCount: 1,
        createdAt,
        updatedAt: decision.createdAt || createdAt,
        slaDeadline: toSlaDeadline(createdAt, priority),
    };
};

const toCaseDetail = async (decision: DecisionProvenance): Promise<CaseDetail> => {
    const base = toCase(decision);
    const explanation = await getExplanation(decision.decisionId);

    const summary = `Provenance captured a ${decision.riskLevel.toLowerCase()} risk decision for ${decision.entityId} at ${new Date(base.createdAt).toLocaleString()}.`;
    const findings = explanation || `Policy ${decision.policyId} (v${decision.policyVersion}) produced this decision with confidence ${Math.round(decision.confidence * 100)}%.`;

    const evidence: CaseEvidence[] = [
        {
            id: `${decision.decisionId}-ev-1`,
            caseId: decision.decisionId,
            type: 'ALERT',
            title: 'Provenance Decision Record',
            description: `Decision ${decision.decisionId} with risk level ${decision.riskLevel}.`,
            source: 'Provenance Service',
            addedBy: 'System',
            addedAt: base.createdAt,
            metadata: {
                provenanceId: decision.provenanceId,
                policyHash: decision.policyHash,
                policyFallback: decision.policyFallback,
            },
        },
    ];

    const timeline: CaseTimelineEvent[] = [
        {
            id: `${decision.decisionId}-tl-1`,
            type: 'CREATED',
            description: 'Case synthesized from provenance decision stream.',
            timestamp: base.createdAt,
        },
        {
            id: `${decision.decisionId}-tl-2`,
            type: 'STATUS_CHANGE',
            description: `Initial status set to ${base.status}.`,
            timestamp: base.updatedAt,
        },
    ];

    const comments: CaseComment[] = explanation
        ? [
            {
                id: `${decision.decisionId}-comment-1`,
                caseId: decision.decisionId,
                author: 'Explainability Engine',
                content: explanation,
                isInternal: true,
                createdAt: base.updatedAt,
            },
        ]
        : [];

    return {
        ...base,
        summary,
        findings,
        recommendation: recommendationForRisk(decision.riskLevel),
        evidence,
        timeline,
        comments,
        relatedAlerts: [decision.decisionId],
        relatedControls: decision.policyId ? [decision.policyId] : [],
        tags: ['trust', 'provenance', decision.riskLevel.toLowerCase()],
        riskScore: toRiskScore(decision),
    };
};

const recommendationForRisk = (riskLevel?: string): string => {
    switch ((riskLevel || '').toUpperCase()) {
        case 'CRITICAL':
            return 'Escalate immediately and restrict high-risk access until investigation closure.';
        case 'HIGH':
            return 'Start immediate analyst investigation and enforce adaptive controls.';
        case 'MEDIUM':
            return 'Review related activity and monitor for repeated risky behavior.';
        default:
            return 'Continue monitoring and include in periodic trust review.';
    }
};

const toRiskLevelFilter = (priority?: CasePriority): string | undefined => {
    return priority;
};

const getExplanation = async (decisionId: string): Promise<string | null> => {
    try {
        const payload = await get<Record<string, unknown>>(`${PROVENANCE_BASE_PATH}/explain/decision/${decisionId}`);

        if (typeof payload.explanation === 'string') {
            return payload.explanation;
        }

        if (Array.isArray(payload.explanation)) {
            return payload.explanation.filter((item): item is string => typeof item === 'string').join(' ');
        }

        if (typeof payload.summary === 'string') {
            return payload.summary;
        }

        return null;
    } catch {
        return null;
    }
};

export const getCases = async (filters?: CaseFilters): Promise<CaseListResponse> => {
    const decisions = await get<DecisionProvenance[]>(`${PROVENANCE_BASE_PATH}/decisions`, {
        entityId: undefined,
        riskLevel: toRiskLevelFilter(filters?.priority),
        startTime: filters?.dateFrom,
        endTime: filters?.dateTo,
    });

    let cases = decisions.map(toCase);

    if (filters?.search) {
        const search = filters.search.toLowerCase();
        cases = cases.filter((item) =>
            item.id.toLowerCase().includes(search)
            || item.title.toLowerCase().includes(search)
            || item.description.toLowerCase().includes(search)
            || item.subject.toLowerCase().includes(search)
        );
    }

    if (filters?.status) {
        cases = cases.filter((item) => item.status === filters.status);
    }

    if (filters?.priority) {
        cases = cases.filter((item) => item.priority === filters.priority);
    }

    cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const start = (page - 1) * pageSize;

    return {
        cases: cases.slice(start, start + pageSize),
        total: cases.length,
        page,
        pageSize,
    };
};

export const getCaseById = async (id: string): Promise<CaseDetail> => {
    const decision = await get<DecisionProvenance>(`${PROVENANCE_BASE_PATH}/decisions/${id}`);
    return toCaseDetail(decision);
};

export const createCase = async (_data: {
    title: string;
    description: string;
    subject: string;
    priority: CasePriority;
}): Promise<Case> => {
    throw new Error('Live backend does not expose case creation yet.');
};

export const updateCaseStatus = async (_id: string, _status: CaseStatus): Promise<Case> => {
    throw new Error('Live backend does not expose case status updates yet.');
};

export const addCaseComment = async (_id: string, _content: string, _isInternal = true): Promise<CaseComment> => {
    throw new Error('Live backend does not expose case comments yet.');
};

