import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketProvider';
import { useInsightXStore } from '../store/useInsightXStore';
import type { TrustDecision } from '../api/trust.types';

export function useTrustStream() {
    const { socket, isConnected } = useWebSocket();
    const [lastDecision, setLastDecision] = useState<TrustDecision | null>(null);

    const addLiveDecision = useInsightXStore((s) => s.addLiveDecision);
    const incrementCriticalAlerts = useInsightXStore((s) => s.incrementCriticalAlerts);

    useEffect(() => {
        if (!socket) return;

        const handleDecision = (decision: TrustDecision) => {
            console.log('[WS] Trust decision received:', decision.decisionId);
            setLastDecision(decision);
            addLiveDecision(decision);

            if (decision.riskLevel === 'CRITICAL') {
                incrementCriticalAlerts();
            }
        };

        socket.on('trust-decision', handleDecision);

        return () => {
            socket.off('trust-decision', handleDecision);
        };
    }, [socket, addLiveDecision, incrementCriticalAlerts]);

    return {
        connected: isConnected,
        lastDecision,
        error: null,
    };
}
