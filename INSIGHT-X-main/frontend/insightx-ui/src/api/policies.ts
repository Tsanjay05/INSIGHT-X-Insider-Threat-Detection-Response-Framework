/**
 * Policies API client
 */

import type {
    Policy,
    PolicyDetail,
    PolicyListResponse,
    PolicyFilters,
} from './policies.types';

import { get, put } from './client';

const API_BASE_PATH = '/api/v1/policies';

export const getPolicies = async (filters?: PolicyFilters): Promise<PolicyListResponse> => {
    return get<PolicyListResponse>(API_BASE_PATH, filters as Record<string, any>);
};

export const getPolicyById = async (id: string): Promise<PolicyDetail> => {
    return get<PolicyDetail>(`${API_BASE_PATH}/${id}`);
};

export const togglePolicy = async (id: string, enabled: boolean): Promise<Policy> => {
    return put<Policy>(`${API_BASE_PATH}/${id}/toggle`, { enabled });
};
