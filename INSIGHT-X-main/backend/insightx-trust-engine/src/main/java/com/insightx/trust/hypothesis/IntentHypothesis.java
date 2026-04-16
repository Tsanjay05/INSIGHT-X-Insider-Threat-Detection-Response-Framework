package com.insightx.trust.hypothesis;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a specific hypothesis about a user's intent.
 * 
 * <p>
 * Corresponds to FR-3.1 (Concurrent intent hypotheses with confidence bounds).
 */
public record IntentHypothesis(
        UUID hypothesisId,
        String userId,
        HypothesisType type,
        double confidenceScore, // 0.0 to 1.0
        String evidenceSummary,
        Instant createdAt,
        Instant updatedAt) {
    public IntentHypothesis(String userId, HypothesisType type, double confidenceScore, String evidenceSummary) {
        this(UUID.randomUUID(), userId, type, confidenceScore, evidenceSummary, Instant.now(), Instant.now());
    }

    public IntentHypothesis withUpdatedConfidence(double newConfidence, String newEvidence) {
        return new IntentHypothesis(this.hypothesisId, this.userId, this.type, newConfidence, newEvidence,
                this.createdAt, Instant.now());
    }
}
