/**
 * Trust Engine API Client
 */
import { get, post } from './client';

const API_BASE_PATH = '/api/v1/trust';

// --- Types ----------------------------------------------------------
export interface NormalizedSignal {
    id: string;
    source: string;
    type: string;
    value: number;
    weight: number;
    severity: number;
    description: string;
    observedAt: string;
    contribution?: number;
}

export interface EvaluateTrustRequest {
    entityId: string;
    normalizedSignals: NormalizedSignal[];
    evaluationTimestamp: string;
}

export interface EvaluateTrustResponse {
    decisionId: string;
    entityId: string;
    trustScore: number;
    confidence: number;
    riskLevel: string;
    appliedPolicies: Record<string, boolean>;
    humanInLoopRequired: boolean;
    explanation: string[];
}

export interface TrustHistoryEntry {
    decisionId: string;
    entityId: string;
    trustScore: number;
    confidence: number;
    riskLevel: string;
    timestamp: string;
}

export interface TrustDelta {
    category: string;
    trustDelta: number;
    confidenceDelta: number;
    description: string;
    reason: string;
    timestamp: string;
}

export interface TrustDecision {
    decisionId: string;
    entityId: string;
    finalScore: { value: number; confidence: number };
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    policyFlags: string[];
    orderedDeltas: TrustDelta[];
    decidedAt: string;
    resultingState: any;
    humanInLoopRequired?: boolean;
}

export interface TrustStateResponse {
    entityId: string;
    trustScore: number;
    confidence: number;
    lastUpdated: string;
}

export interface TrustScore extends TrustStateResponse {
    factors?: NormalizedSignal[];
}

// --- API Calls -------------------------------------------------------
export const getTrustState = async (userId: string): Promise<TrustStateResponse> => {
    return get<TrustStateResponse>(`${API_BASE_PATH}/users/${userId}`);
};

export const getTrustHistory = async (userId: string, limit: number = 20): Promise<TrustHistoryEntry[]> => {
    return get<TrustHistoryEntry[]>(`${API_BASE_PATH}/users/${userId}/history`, { limit });
};

export const evaluateTrust = async (request: EvaluateTrustRequest): Promise<EvaluateTrustResponse> => {
    return post<EvaluateTrustResponse>(`${API_BASE_PATH}/evaluate`, request);
};

// --- UI Helper -------------------------------------------------------
export interface EntityTrust {
    currentScore: { value: number; confidence: number };
    lastEvaluated: string;
}

export const trustApi = {
    getEntityTrust: async (entityId: string): Promise<EntityTrust> => {
        const state = await getTrustState(entityId);
        return {
            currentScore: { value: state.trustScore, confidence: state.confidence },
            lastEvaluated: state.lastUpdated,
        };
    },

    getTrustHistory: async (entityId: string, limit: number = 20): Promise<TrustHistoryEntry[]> => {
        return getTrustHistory(entityId, limit);
    },
};
