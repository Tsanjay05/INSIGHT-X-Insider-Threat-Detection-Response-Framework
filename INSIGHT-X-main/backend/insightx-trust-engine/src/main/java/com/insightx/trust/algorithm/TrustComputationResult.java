package com.insightx.trust.algorithm;

import com.insightx.trust.domain.TrustScore;

import java.util.List;
import java.util.Objects;

/**
 * Result of deterministic trust computation from a baseline score and indicators.
 */
public record TrustComputationResult(
        TrustScore computedScore,
        double rawDelta,
        double appliedDelta,
        double negativeRateLimit,
        List<String> explanation
) {
    public TrustComputationResult {
        Objects.requireNonNull(computedScore, "computedScore must not be null");
        Objects.requireNonNull(explanation, "explanation must not be null");
        explanation = List.copyOf(explanation);
        if (Double.isNaN(rawDelta) || Double.isInfinite(rawDelta)) {
            throw new IllegalArgumentException("rawDelta must be finite");
        }
        if (Double.isNaN(appliedDelta) || Double.isInfinite(appliedDelta)) {
            throw new IllegalArgumentException("appliedDelta must be finite");
        }
        if (Double.isNaN(negativeRateLimit) || Double.isInfinite(negativeRateLimit) || negativeRateLimit < 0.0) {
            throw new IllegalArgumentException("negativeRateLimit must be finite and >= 0");
        }
    }
}

