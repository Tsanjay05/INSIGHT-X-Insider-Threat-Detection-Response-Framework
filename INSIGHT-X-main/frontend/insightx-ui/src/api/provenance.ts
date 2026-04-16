import { get, createSSE } from './client';
import type { DecisionProvenance, ProvenanceDetail, ForensicTimelineEvent } from './provenance.types';

const API_BASE_PATH = '/api/v1/provenance';

const toProvenanceDetail = (decision: DecisionProvenance): ProvenanceDetail => ({
    ...decision,
    signals: [],
    controlsApplied: [],
    explanation: '',
});

const toForensicTimeline = (decision: DecisionProvenance): ForensicTimelineEvent => ({
    timestamp: decision.decisionTimestamp,
    eventType: 'DECISION',
    data: decision,
});

export const provenanceApi = {
    /**
     * Get all decision provenance records with filters
     */
    getDecisions: (filters?: {
        entityId?: string;
        startTime?: string;
        endTime?: string;
        riskLevel?: string;
    }): Promise<DecisionProvenance[]> => {
        return get<DecisionProvenance[]>(`${API_BASE_PATH}/decisions`, filters);
    },

    /**
     * Get detailed provenance for a specific decision
     */
    getDecisionById: async (decisionId: string): Promise<ProvenanceDetail> => {
        const decision = await get<DecisionProvenance>(`${API_BASE_PATH}/decisions/${decisionId}`);
        return toProvenanceDetail(decision);
    },

    /**
     * Get forensic timeline for an entity
     */
    getForensicTimeline: async (entityId: string): Promise<ForensicTimelineEvent[]> => {
        const decisions = await get<DecisionProvenance[]>(`${API_BASE_PATH}/forensic/${entityId}`);
        return decisions.map(toForensicTimeline);
    },

    /**
     * Create SSE connection for live provenance events
     */
    streamProvenance: (): EventSource => {
        return createSSE('/stream/provenance');
    },
};
