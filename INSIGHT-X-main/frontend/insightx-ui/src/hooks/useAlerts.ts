import { useMemo } from 'react';
import { useInsightXStore } from '../store/useInsightXStore';
import type { TrustDecision } from '../api/trust.types';

export interface Alert {
    id: string;
    entityId: string;
    timestamp: Date;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
    acknowledged: boolean;
}

/**
 * Hook for aggregating active alerts from live decision stream
 * Filters CRITICAL and HIGH risk decisions for alert display
 */
export function useAlerts() {
    const liveDecisions = useInsightXStore((s) => s.liveDecisions);
    const criticalAlertCount = useInsightXStore((s) => s.criticalAlertCount);

    const alerts = useMemo(() => {
        // Filter decisions with CRITICAL or HIGH risk
        const criticalDecisions = liveDecisions.filter(
            (d) => d.riskLevel === 'CRITICAL' || d.riskLevel === 'HIGH'
        );

        // Map to Alert format
        return criticalDecisions.map((decision: TrustDecision): Alert => ({
            id: decision.decisionId,
            entityId: decision.entityId,
            timestamp: new Date(decision.decidedAt),
            severity: decision.riskLevel as 'CRITICAL' | 'HIGH',
            title: `${decision.riskLevel} Risk Detected for ${decision.entityId}`,
            message: `Trust score dropped to ${decision.finalScore.value.toFixed(1)} (confidence: ${(decision.finalScore.confidence * 100).toFixed(0)}%)`,
            acknowledged: false,
        }));
    }, [liveDecisions]);

    const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

    return {
        alerts,
        unacknowledgedCount,
        criticalAlertCount,
        hasAlerts: alerts.length > 0,
    };
}
