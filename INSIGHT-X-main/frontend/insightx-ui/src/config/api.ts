/**
 * API configuration for HTTP requests
 */

import { env } from './env';

export const API_CONFIG = {
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,

    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },

    retry: {
        maxRetries: 3,
        retryDelay: 1000,
        retryOn: [408, 429, 500, 502, 503, 504],
    },

    cache: {
        enabled: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    },
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
    // Trust Engine
    TRUST_STATE: '/trust/state',
    TRUST_EVALUATE: '/trust/evaluate',
    TRUST_HISTORY: '/trust/history',
    TRUST_STREAM: '/trust/stream',

    // Controls
    CONTROLS_LIST: '/controls',
    CONTROLS_APPROVE: '/controls/approve',
    CONTROLS_REVOKE: '/controls/revoke',
    CONTROLS_DETAIL: '/controls/:id',

    // Intent
    INTENT_LIST: '/intent/hypotheses',
    INTENT_DETAIL: '/intent/:id',

    // Provenance
    PROVENANCE_LIST: '/provenance',
    PROVENANCE_DETAIL: '/provenance/:id',
    PROVENANCE_TIMELINE: '/provenance/:id/timeline',

    // Graph/Campaigns
    CAMPAIGNS_LIST: '/graph/campaigns',
    CAMPAIGN_DETAIL: '/graph/campaigns/:id',
    CAMPAIGN_ENTITIES: '/graph/campaigns/:id/entities',

    // Future APIs (placeholders)
    ALERTS: '/alerts',
    CASES: '/cases',
    POLICIES: '/policies',
    REPORTS: '/reports',
    USERS: '/users',
    SETTINGS: '/settings',
} as const;

/**
 * Build API URL with parameters
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
    let url = endpoint;
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url = url.replace(`:${key}`, String(value));
        }
    }
    return url;
};
