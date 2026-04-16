// Intent API Types
export interface IntentHypothesis {
    hypothesisId: string;
    entityId: string;
    intentType: string;
    confidence: number;
    lastUpdated: string;
    evidence: string[];
    corroborationSources: string[];
}

export interface IntentDetail extends IntentHypothesis {
    confidenceHistory: Array<{
        timestamp: string;
        confidence: number;
    }>;
    signals: Array<{
        signalId: string;
        contribution: number;
        timestamp: string;
    }>;
}
