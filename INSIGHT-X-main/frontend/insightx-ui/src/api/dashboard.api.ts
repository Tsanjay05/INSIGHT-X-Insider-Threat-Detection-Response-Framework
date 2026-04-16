/**
 * Dashboard API module.
 * Aligns with Master-Front Phase 3 (Dashboard Implementation).
 * Replace mock/static dashboard data with these endpoints when backend is ready.
 */

import { get } from './client';

export interface DashboardMetrics {
    totalUsers: number;
    activeThreats: number;
    criticalAlerts: number;
    averageTrustScore: number;
    trends: {
        users: number;
        threats: number;
        alerts: number;
        trustScore: number;
    };
}

export interface RiskDistribution {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

export interface ThreatTrend {
    date: string;
    count: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export const dashboardApi = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        return get<DashboardMetrics>('/api/v1/dashboard/metrics');
    },

    getRiskDistribution: async (): Promise<RiskDistribution> => {
        return get<RiskDistribution>('/api/v1/dashboard/risk-distribution');
    },

    getThreatTrends: async (days: number = 30): Promise<ThreatTrend[]> => {
        return get<ThreatTrend[]>('/api/v1/dashboard/threat-trends', { days });
    },
};

