package com.insightx.trust.domain;

/**
 * Immutable, bounded trust score for an entity.
 * <p>
 * - {@code value} is a normalized score in the range [0, 100].
 * - {@code confidence} is a model confidence in the range [0, 1].
 */
public final class TrustScore {

    private final double value;
    private final double confidence;

    public TrustScore(double value, double confidence) {
        this.value = enforceScoreBounds(value);
        this.confidence = enforceConfidenceBounds(confidence);
    }

    private double enforceScoreBounds(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            throw new IllegalArgumentException("TrustScore value must be a finite number");
        }
        if (value < 0.0 || value > 100.0) {
            throw new IllegalArgumentException("TrustScore value must be between 0 and 100 inclusive, was " + value);
        }
        return value;
    }

    private double enforceConfidenceBounds(double confidence) {
        if (Double.isNaN(confidence) || Double.isInfinite(confidence)) {
            throw new IllegalArgumentException("TrustScore confidence must be a finite number");
        }
        if (confidence < 0.0 || confidence > 1.0) {
            throw new IllegalArgumentException("TrustScore confidence must be between 0 and 1 inclusive, was " + confidence);
        }
        return confidence;
    }

    public double getValue() {
        return value;
    }

    public double getConfidence() {
        return confidence;
    }
}

