package com.insightx.trust.algorithm;

import com.insightx.trust.domain.TrustScore;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

/**
 * Deterministic trust "staleness" decay.
 *
 * <p>
 * Trust is evidence-based. As evidence becomes stale, the score deterministically drifts
 * toward a neutral baseline (50.0) at a bounded rate.
 *
 * <p>
 * This is not randomness and does not model human behavior; it models information staleness.
 */
public final class TemporalDecayCalculator {

    private final double neutralBaseline;
    private final double maxPointsPerHour;
    private final double confidenceDecayPerHour;

    public TemporalDecayCalculator(double neutralBaseline,
                                   double maxPointsPerHour,
                                   double confidenceDecayPerHour) {
        if (Double.isNaN(neutralBaseline) || Double.isInfinite(neutralBaseline)) {
            throw new IllegalArgumentException("neutralBaseline must be a finite number");
        }
        if (neutralBaseline < 0.0 || neutralBaseline > 100.0) {
            throw new IllegalArgumentException("neutralBaseline must be between 0 and 100 inclusive");
        }
        if (!(maxPointsPerHour >= 0.0) || Double.isNaN(maxPointsPerHour) || Double.isInfinite(maxPointsPerHour)) {
            throw new IllegalArgumentException("maxPointsPerHour must be a finite number >= 0");
        }
        if (!(confidenceDecayPerHour >= 0.0) || Double.isNaN(confidenceDecayPerHour) || Double.isInfinite(confidenceDecayPerHour)) {
            throw new IllegalArgumentException("confidenceDecayPerHour must be a finite number >= 0");
        }
        this.neutralBaseline = neutralBaseline;
        this.maxPointsPerHour = maxPointsPerHour;
        this.confidenceDecayPerHour = confidenceDecayPerHour;
    }

    public TemporalDecayResult apply(TrustScore currentScore, Instant lastUpdated, Instant evaluationTimestamp) {
        Objects.requireNonNull(currentScore, "currentScore must not be null");
        Objects.requireNonNull(lastUpdated, "lastUpdated must not be null");
        Objects.requireNonNull(evaluationTimestamp, "evaluationTimestamp must not be null");

        if (evaluationTimestamp.isBefore(lastUpdated)) {
            // Clock skew or out-of-order timestamps: no decay applied; deterministic and explainable.
            return new TemporalDecayResult(
                    currentScore,
                    Duration.ZERO,
                    0.0,
                    "No decay applied: evaluationTimestamp is before lastUpdated"
            );
        }

        Duration elapsed = Duration.between(lastUpdated, evaluationTimestamp);
        double hours = elapsed.toSeconds() / 3600.0;

        double value = currentScore.getValue();
        double deltaToNeutral = neutralBaseline - value;
        double maxChange = maxPointsPerHour * hours;

        double appliedChange;
        if (deltaToNeutral == 0.0 || maxChange == 0.0) {
            appliedChange = 0.0;
        } else {
            appliedChange = Math.copySign(Math.min(Math.abs(deltaToNeutral), maxChange), deltaToNeutral);
        }

        double decayedValue = clamp0to100(value + appliedChange);

        double decayedConfidence = clamp0to1(currentScore.getConfidence() - confidenceDecayPerHour * hours);

        TrustScore decayed = new TrustScore(decayedValue, decayedConfidence);
        String explanation = "Applied staleness decay toward baseline " + neutralBaseline
                + " over " + hours + "h"
                + " (valueChange=" + appliedChange + ", confidenceDecay=" + (currentScore.getConfidence() - decayedConfidence) + ")";

        return new TemporalDecayResult(decayed, elapsed, appliedChange, explanation);
    }

    private double clamp0to100(double v) {
        return Math.max(0.0, Math.min(100.0, v));
    }

    private double clamp0to1(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }
}

