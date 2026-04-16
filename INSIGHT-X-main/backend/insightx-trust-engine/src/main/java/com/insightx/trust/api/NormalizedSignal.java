package com.insightx.trust.api;

import com.insightx.trust.domain.RiskIndicator;

import java.time.Instant;
import java.util.Objects;

/**
 * Normalized input signal for trust evaluation.
 *
 * <p>
 * This service does NOT ingest raw events. Inputs to this API must already be normalized
 * into deterministic, explainable risk signals.
 */
public record NormalizedSignal(
        String id,
        RiskIndicator.Type type,
        double severity,
        double contribution,
        String description,
        String source,
        Instant observedAt
) {
    public NormalizedSignal {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(source, "source must not be null");
        Objects.requireNonNull(observedAt, "observedAt must not be null");
        if (Double.isNaN(severity) || Double.isInfinite(severity) || severity < 0.0 || severity > 1.0) {
            throw new IllegalArgumentException("severity must be in [0,1]");
        }
        if (Double.isNaN(contribution) || Double.isInfinite(contribution) || contribution < -100.0 || contribution > 100.0) {
            throw new IllegalArgumentException("contribution must be in [-100,100]");
        }
    }
}

