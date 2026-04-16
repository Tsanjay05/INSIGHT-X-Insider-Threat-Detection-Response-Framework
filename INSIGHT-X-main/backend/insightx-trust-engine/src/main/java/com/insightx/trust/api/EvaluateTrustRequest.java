package com.insightx.trust.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * Request payload for trust evaluation.
 */
public record EvaluateTrustRequest(
        String entityId,
        List<NormalizedSignal> normalizedSignals,
        Instant evaluationTimestamp
) {
    public EvaluateTrustRequest {
        Objects.requireNonNull(entityId, "entityId must not be null");
        Objects.requireNonNull(evaluationTimestamp, "evaluationTimestamp must not be null");
        normalizedSignals = normalizedSignals == null ? List.of() : List.copyOf(normalizedSignals);
    }
}

