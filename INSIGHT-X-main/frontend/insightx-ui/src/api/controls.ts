import axios from 'axios';
import { get, post, createSSE } from './client';
import type { AdaptiveControl, ApprovalRequest, RevokeControlRequest, ApprovalActionRequest } from './controls.types';

interface AuthMeResponse {
    id: string;
}

const CONTROLS_BASE = '/api/v1/controls';
const APPROVALS_BASE = '/api/v1/approvals';

const getCurrentUserId = async (): Promise<string> => {
    const me = await get<AuthMeResponse>('/api/v1/auth/me');
    if (!me?.id) {
        throw new Error('Unable to resolve current user for controls request.');
    }
    return me.id;
};

export const controlsApi = {
    /**
     * Get controls for current authenticated entity (live endpoint)
     */
    getControls: async (filters?: { status?: string; entityId?: string }): Promise<AdaptiveControl[]> => {
        const entityId = filters?.entityId || await getCurrentUserId();
        const controls = await get<AdaptiveControl[]>(`${CONTROLS_BASE}/explain/active/${entityId}`);

        if (!filters?.status) {
            return controls;
        }

        return controls.filter((control) => control.status === filters.status);
    },

    /**
     * Get specific control by ID
     */
    getControlById: async (controlId: string): Promise<AdaptiveControl> => {
        const controls = await controlsApi.getControls();
        const control = controls.find((item) => item.controlId === controlId);

        if (!control) {
            throw new Error('Control not found.');
        }

        return control;
    },

    /**
     * Revoke an active control (endpoint may not be implemented in current backend)
     */
    revokeControl: async (controlId: string, request: RevokeControlRequest): Promise<AdaptiveControl> => {
        return post<AdaptiveControl>(`${CONTROLS_BASE}/${controlId}/revoke`, request);
    },

    /**
     * Get all approval requests
     */
    getApprovals: async (filters?: { status?: string }): Promise<ApprovalRequest[]> => {
        try {
            return await get<ApprovalRequest[]>(APPROVALS_BASE, filters);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    /**
     * Approve a request
     */
    approveRequest: (requestId: string, request?: ApprovalActionRequest): Promise<ApprovalRequest> => {
        return post<ApprovalRequest>(`${APPROVALS_BASE}/${requestId}/approve`, request);
    },

    /**
     * Deny a request
     */
    denyRequest: (requestId: string, request?: ApprovalActionRequest): Promise<ApprovalRequest> => {
        return post<ApprovalRequest>(`${APPROVALS_BASE}/${requestId}/deny`, request);
    },

    /**
     * Create SSE connection for live control events
     */
    streamControls: (): EventSource => {
        return createSSE('/stream/controls');
    },
};
