package com.insightx.trust.domain;

/**
 * Centralized constants and validation for the Trust Engine.
 * <p>
 * These invariants are enforced at runtime to prevent illegal trust states.
 * All trust computations must respect these boundaries.
 */
public final class TrustInvariants {

    // Trust Score Boundaries
    public static final double MIN_TRUST_SCORE = 0.0;
    public static final double MAX_TRUST_SCORE = 100.0;
    public static final double INITIAL_TRUST_SCORE = 50.0; // Neutral start

    // Confidence Boundaries
    public static final double MIN_CONFIDENCE = 0.0;
    public static final double MAX_CONFIDENCE = 1.0;
    public static final double INITIAL_CONFIDENCE = 0.5; // Moderate confidence

    // Decay Constants
    public static final double DECAY_RATE_PER_HOUR = 0.5; // Points per hour towards baseline
    public static final double DECAY_BASELINE = 50.0; // Trust decays towards this value

    private TrustInvariants() {
        // Prevent instantiation
    }

    /**
     * Validates that a trust score is within valid bounds [0.0, 100.0].
     *
     * @param score the score to validate
     * @return the valid score
     * @throws IllegalArgumentException if the score is invalid
     */
    public static double validateScore(double score) {
        if (!Double.isFinite(score)) {
            throw new IllegalArgumentException("Trust score must be finite: " + score);
        }
        if (score < MIN_TRUST_SCORE || score > MAX_TRUST_SCORE) {
            throw new IllegalArgumentException(String.format("Trust score %.2f is out of bounds [%.1f, %.1f]",
                    score, MIN_TRUST_SCORE, MAX_TRUST_SCORE));
        }
        return score;
    }

    /**
     * Clamps a raw calculated score to the valid range [0.0, 100.0].
     * Use this during calculations where over/underflow is possible before final
     * validation.
     *
     * @param rawScore the calculated score
     * @return the score clamped to [0.0, 100.0]
     */
    public static double clampScore(double rawScore) {
        if (rawScore < MIN_TRUST_SCORE)
            return MIN_TRUST_SCORE;
        if (rawScore > MAX_TRUST_SCORE)
            return MAX_TRUST_SCORE;
        return rawScore;
    }

    /**
     * Validates that confidence is within valid bounds [0.0, 1.0].
     *
     * @param confidence the confidence to validate
     * @return the valid confidence
     * @throws IllegalArgumentException if the confidence is invalid
     */
    public static double validateConfidence(double confidence) {
        if (!Double.isFinite(confidence)) {
            throw new IllegalArgumentException("Confidence must be finite: " + confidence);
        }
        if (confidence < MIN_CONFIDENCE || confidence > MAX_CONFIDENCE) {
            throw new IllegalArgumentException(String.format("Confidence %.2f is out of bounds [%.1f, %.1f]",
                    confidence, MIN_CONFIDENCE, MAX_CONFIDENCE));
        }
        return confidence;
    }

    /**
     * Clamps a raw calculated confidence to the valid range [0.0, 1.0].
     *
     * @param rawConfidence the calculated confidence
     * @return the confidence clamped to [0.0, 1.0]
     */
    public static double clampConfidence(double rawConfidence) {
        if (rawConfidence < MIN_CONFIDENCE)
            return MIN_CONFIDENCE;
        if (rawConfidence > MAX_CONFIDENCE)
            return MAX_CONFIDENCE;
        return rawConfidence;
    }
}
