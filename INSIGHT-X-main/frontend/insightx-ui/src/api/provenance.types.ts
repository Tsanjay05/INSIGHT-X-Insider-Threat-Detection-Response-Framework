// Provenance API Types
export interface DecisionProvenance {
    provenanceId: string;
    decisionId: string;
    entityId: string;
    decisionTimestamp: string;
    trustScore: number;
    confidence: number;
    riskLevel: string;
    policyId: string;
    policyVersion: string;
    policyHash: string;
    policyFallback: boolean;
    isSimulation: boolean;
    createdAt: string;
}

export interface ProvenanceSignal {
    signalId: string;
    type: string;
    severity: number;
    contribution: number;
    source: string;
    observedAt: string;
}

export interface ProvenanceDetail extends DecisionProvenance {
    signals: ProvenanceSignal[];
    controlsApplied: string[];
    explanation: string;
}

export interface ForensicTimelineEvent {
    timestamp: string;
    eventType: 'DECISION' | 'SIGNAL' | 'CONTROL';
    data: any;
}
