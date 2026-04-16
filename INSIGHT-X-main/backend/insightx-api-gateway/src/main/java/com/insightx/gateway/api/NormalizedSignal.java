package com.insightx.gateway.api;

import java.time.Instant;

public record NormalizedSignal(
        String id,
        String type, // ✅ STRING, not RiskIndicator.Type
        double severity,
        double contribution,
        String description,
        String source,
        Instant observedAt) {
    public NormalizedSignal {
        if (id == null)
            throw new IllegalArgumentException("id must not be null");
        if (type == null)
            throw new IllegalArgumentException("type must not be null");
        if (source == null)
            throw new IllegalArgumentException("source must not be null");
        if (observedAt == null)
            throw new IllegalArgumentException("observedAt must not be null");
        if (Double.isNaN(severity) || Double.isInfinite(severity) || severity < 0.0 || severity > 1.0) {
            throw new IllegalArgumentException("severity must be in [0,1]");
        }
        if (Double.isNaN(contribution) || Double.isInfinite(contribution) || contribution < -100.0
                || contribution > 100.0) {
            throw new IllegalArgumentException("contribution must be in [-100,100]");
        }
    }
}
