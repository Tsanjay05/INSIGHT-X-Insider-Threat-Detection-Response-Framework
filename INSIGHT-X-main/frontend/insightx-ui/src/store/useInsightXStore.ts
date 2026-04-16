import { create } from 'zustand';
import type { TrustDecision } from '../api/trust.types';

interface InsightXState {
    // User selection
    selectedUserId: string | null;
    setSelectedUserId: (userId: string | null) => void;

    // SSE stream status
    sseConnected: boolean;
    setSseConnected: (connected: boolean) => void;

    // Live decision ring buffer (last 50 decisions)
    liveDecisions: TrustDecision[];
    addLiveDecision: (decision: TrustDecision) => void;
    clearLiveDecisions: () => void;

    // Critical alert counter (session-based)
    criticalAlertCount: number;
    incrementCriticalAlerts: () => void;
    resetCriticalAlerts: () => void;
}

const MAX_LIVE_DECISIONS = 50;

/**
 * Global Zustand store for INSIGHT-X application state
 * Manages SSE connection, live decision buffer, and critical alerts
 */
export const useInsightXStore = create<InsightXState>((set) => ({
    // User selection
    selectedUserId: null,
    setSelectedUserId: (userId) => set({ selectedUserId: userId }),

    // SSE stream status
    sseConnected: false,
    setSseConnected: (connected) => set({ sseConnected: connected }),

    // Live decision ring buffer
    liveDecisions: [],
    addLiveDecision: (decision) =>
        set((state) => {
            const updated = [decision, ...state.liveDecisions];
            // Keep only last MAX_LIVE_DECISIONS
            return { liveDecisions: updated.slice(0, MAX_LIVE_DECISIONS) };
        }),
    clearLiveDecisions: () => set({ liveDecisions: [] }),

    // Critical alert counter
    criticalAlertCount: 0,
    incrementCriticalAlerts: () =>
        set((state) => ({ criticalAlertCount: state.criticalAlertCount + 1 })),
    resetCriticalAlerts: () => set({ criticalAlertCount: 0 }),
}));
