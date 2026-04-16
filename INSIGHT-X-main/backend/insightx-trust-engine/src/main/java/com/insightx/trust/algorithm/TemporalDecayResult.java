package com.insightx.trust.algorithm;

import com.insightx.trust.domain.TrustScore;

import java.time.Duration;
import java.util.Objects;

/**
 * Deterministic output of temporal decay.
 */
public record TemporalDecayResult(
        TrustScore decayedScore,
        Duration elapsedSinceLastUpdate,
        double valueChangeApplied,
        String explanation
) {
    public TemporalDecayResult {
        Objects.requireNonNull(decayedScore, "decayedScore must not be null");
        Objects.requireNonNull(elapsedSinceLastUpdate, "elapsedSinceLastUpdate must not be null");
        Objects.requireNonNull(explanation, "explanation must not be null");
    }
}

