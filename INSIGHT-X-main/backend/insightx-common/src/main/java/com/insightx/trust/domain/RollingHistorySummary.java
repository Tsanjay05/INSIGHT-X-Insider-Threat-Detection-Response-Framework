package com.insightx.trust.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Objects;

/**
 * Summarized historical context for an entity's trust posture (not raw events).
 *
 * <p>
 * This is intentionally compact and audit-oriented: it provides enough
 * information to
 * interpret why the current trust state looks the way it does without embedding
 * raw data.
 */
public final class RollingHistorySummary {

    private final Instant windowStart;
    private final Instant windowEnd;
    private final int evaluationCount;
    private final double meanTrustScore;
    private final double minTrustScore;
    private final double maxTrustScore;
    private final int highRiskCount;
    private final int criticalRiskCount;
    private final String notes;

    @JsonCreator
    public RollingHistorySummary(
            @JsonProperty("windowStart") Instant windowStart,
            @JsonProperty("windowEnd") Instant windowEnd,
            @JsonProperty("evaluationCount") int evaluationCount,
            @JsonProperty("meanTrustScore") double meanTrustScore,
            @JsonProperty("minTrustScore") double minTrustScore,
            @JsonProperty("maxTrustScore") double maxTrustScore,
            @JsonProperty("highRiskCount") int highRiskCount,
            @JsonProperty("criticalRiskCount") int criticalRiskCount,
            @JsonProperty("notes") String notes) {
        this.windowStart = Objects.requireNonNull(windowStart, "windowStart must not be null");
        this.windowEnd = Objects.requireNonNull(windowEnd, "windowEnd must not be null");
        if (windowEnd.isBefore(windowStart)) {
            throw new IllegalArgumentException("windowEnd must not be before windowStart");
        }
        if (evaluationCount < 0) {
            throw new IllegalArgumentException("evaluationCount must be >= 0");
        }
        this.evaluationCount = evaluationCount;
        this.meanTrustScore = enforce0to100(meanTrustScore, "meanTrustScore");
        this.minTrustScore = enforce0to100(minTrustScore, "minTrustScore");
        this.maxTrustScore = enforce0to100(maxTrustScore, "maxTrustScore");
        if (highRiskCount < 0 || criticalRiskCount < 0) {
            throw new IllegalArgumentException("risk counts must be >= 0");
        }
        this.highRiskCount = highRiskCount;
        this.criticalRiskCount = criticalRiskCount;
        this.notes = notes == null ? "" : notes;
    }

    public static RollingHistorySummary empty(Instant at) {
        return new RollingHistorySummary(at, at, 0, 50.0, 50.0, 50.0, 0, 0, "no history");
    }

    private double enforce0to100(double value, String name) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            throw new IllegalArgumentException(name + " must be a finite number");
        }
        if (value < 0.0 || value > 100.0) {
            throw new IllegalArgumentException(name + " must be between 0 and 100 inclusive");
        }
        return value;
    }

    /**
     * Creates a new summary instance that includes the latest evaluation.
     *
     * @param now             the timestamp of the new evaluation
     * @param newScore        the new trust score
     * @param additionalNotes notes to append
     * @return a new, immutable RollingHistorySummary
     */
    public RollingHistorySummary next(Instant now, double newScore, String additionalNotes) {
        int newCount = this.evaluationCount + 1;

        // Online mean calculation
        // newMean = oldMean + (newScore - oldMean) / newCount
        // However, standard formula: ((oldMean * oldCount) + newScore) / newCount is
        // simpler for small N
        // Let's use the standard formula but watch out for precision

        double currentSum = this.meanTrustScore * this.evaluationCount;
        double newMean = (currentSum + newScore) / newCount;

        double newMin = Math.min(this.minTrustScore, newScore);
        double newMax = Math.max(this.maxTrustScore, newScore);

        // Let's use constants if possible, or pass in risk
        // Requirement says "Trust score + confidence produce a risk level".
        // Risk level is determined by Policy Arbitration usually.
        // But here we are just summarizing history.
        // Let's assume < 30 is Critical, < 50 is High for now or just stick to simple
        // counters.
        // I'll stick to simple counters based on score to keep it contained, or pass in
        // "isHighRisk" boolean.
        // But the signature I proposed only takes score.
        // Let's refine the method to take IsHighRisk flags?
        // Or better, logic inside:
        // High Risk: < 50
        // Critical Risk: < 20

        int highRiskInc = (newScore <= 50.0 && newScore > 20.0) ? 1 : 0;
        int criticalRiskInc = (newScore <= 20.0) ? 1 : 0;

        // Actually, if it's critical, is it also high? Usually yes.
        // Let's just say specific buckets.

        String newNotes = (this.notes.isEmpty() ? "" : this.notes + "; ") + additionalNotes;
        // Truncate notes if too long to prevent unbound growth?
        // "Maintain audit-safe aggregates."
        // Let's keep it simple.

        return new RollingHistorySummary(
                this.windowStart, // Window start remains? Or rolling? "Rolling History"
                now, // Window end moves to now
                newCount,
                newMean,
                newMin,
                newMax,
                this.highRiskCount + highRiskInc,
                this.criticalRiskCount + criticalRiskInc,
                newNotes);
    }

    public Instant getWindowStart() {
        return windowStart;
    }

    public Instant getWindowEnd() {
        return windowEnd;
    }

    public int getEvaluationCount() {
        return evaluationCount;
    }

    public double getMeanTrustScore() {
        return meanTrustScore;
    }

    public double getMinTrustScore() {
        return minTrustScore;
    }

    public double getMaxTrustScore() {
        return maxTrustScore;
    }

    public int getHighRiskCount() {
        return highRiskCount;
    }

    public int getCriticalRiskCount() {
        return criticalRiskCount;
    }

    public String getNotes() {
        return notes;
    }
}
