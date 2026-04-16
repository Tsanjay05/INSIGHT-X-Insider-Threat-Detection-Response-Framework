/**
 * Audit & Provenance API Client
 */
import { get } from './client';

const AUDIT_BASE_PATH = '/api/v1/audit';
const PROVENANCE_BASE_PATH = '/api/v1/provenance';

export interface AuditLog {
    id: string;
    entityId?: string;
    action: string;
    actor: string;
    timestamp: string;
    details: string;
    metadata?: Record<string, any>;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export interface AuditLogResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
}

export interface Explanation {
    decisionId: string;
    factor: string;
    impact: number;
    description: string;
    source: string;
}

export interface DecisionProvenance {
    provenanceId: string;
    decisionId: string;
    entityId: string;
    decisionTimestamp: string;
    trustScore: number;
    confidence: number;
    riskLevel: string;
    policyId: string;
    policyVersion: string;
    policyHash: string;
    policyFallback: boolean;
    isSimulation: boolean;
    createdAt: string;
}

interface BackendAuditLog {
    id: number | string;
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    status?: string;
    metadataJson?: string;
}

const normalizeStatus = (status?: string): AuditLog['status'] => {
    const value = (status || '').toUpperCase();
    if (value === 'FAILURE' || value === 'ERROR') return 'FAILURE';
    if (value === 'WARNING' || value === 'WARN') return 'WARNING';
    return 'SUCCESS';
};

export const getAuditLogs = async (params?: Record<string, any>): Promise<AuditLogResponse> => {
    const logs = await get<BackendAuditLog[]>(AUDIT_BASE_PATH, params);

    const mapped: AuditLog[] = logs.map((log) => ({
        id: String(log.id),
        entityId: log.resourceId,
        action: log.action,
        actor: log.actor,
        timestamp: log.timestamp,
        details: log.details || '',
        status: normalizeStatus(log.status),
    }));

    return {
        logs: mapped,
        total: mapped.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || mapped.length || 20,
    };
};

export const getEntityTimeline = async (entityId: string): Promise<DecisionProvenance[]> => {
    return get<DecisionProvenance[]>(`${PROVENANCE_BASE_PATH}/timeline/${entityId}`);
};

export const getDecision = async (decisionId: string): Promise<DecisionProvenance> => {
    return get<DecisionProvenance>(`${PROVENANCE_BASE_PATH}/decision/${decisionId}`);
};

export const getExplanation = async (decisionId: string): Promise<Record<string, any>> => {
    return get<Record<string, any>>(`${PROVENANCE_BASE_PATH}/explain/decision/${decisionId}`);
};
