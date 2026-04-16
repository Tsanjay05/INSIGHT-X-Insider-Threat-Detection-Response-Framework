import { get } from './client';
import type { IntentHypothesis, IntentDetail } from './intent.types';

export const intentApi = {
    /**
     * Get all intent hypotheses
     */
    getAllHypotheses: (filters?: { minConfidence?: number }): Promise<IntentHypothesis[]> => {
        return get<IntentHypothesis[]>('/api/intent/hypotheses', filters);
    },

    /**
     * Get detailed hypothesis for a specific entity
     */
    getHypothesis: (entityId: string): Promise<IntentDetail> => {
        return get<IntentDetail>(`/api/intent/${entityId}`);
    },
};
