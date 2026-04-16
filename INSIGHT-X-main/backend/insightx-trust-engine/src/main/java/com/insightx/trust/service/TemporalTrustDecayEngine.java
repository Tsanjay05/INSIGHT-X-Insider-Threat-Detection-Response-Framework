package com.insightx.trust.service;

import com.insightx.trust.domain.TrustDelta;
import com.insightx.trust.domain.TrustInvariants;
import com.insightx.trust.domain.TrustScore;
import com.insightx.trust.domain.TrustSource;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Deterministic engine for computing temporal trust decay.
 * <p>
 * Trust decays over time towards a baseline (neutral) score if no signals are
 * received.
 * Confidence also decays but at a slower rate, reflecting uncertainty
 * accumulation.
 */
@Service
public class TemporalTrustDecayEngine {

    /**
     * Computes the trust decay delta based on the time elapsed since the last
     * update.
     *
     * @param currentScore the current trust score
     * @param lastUpdated  the timestamp of the last update
     * @param now          the current evaluation timestamp
     * @return a TrustDelta representing the decay (or empty if no decay)
     */
    public TrustDelta computeDecay(TrustScore currentScore, Instant lastUpdated, Instant now) {
        if (now.isBefore(lastUpdated)) {
            throw new IllegalArgumentException("Current time cannot be before last updated time");
        }

        long secondsElapsed = Duration.between(lastUpdated, now).getSeconds();
        if (secondsElapsed <= 0) {
            return TrustDelta.of(0.0, 0.0, "No time elapsed", TrustSource.DECAY, now);
        }

        double hoursElapsed = secondsElapsed / 3600.0;

        // 1. Calculate Trust Score Decay
        // Direction is towards the baseline (50.0)
        double currentVal = currentScore.getValue();
        double target = TrustInvariants.DECAY_BASELINE;
        double gap = target - currentVal;

        // If we are effectively at baseline, no trust decay
        double trustDeltaVal = 0.0;
        if (Math.abs(gap) > 0.001) {
            // Decay is proportional to the gap? Or linear?
            // Implementation Plan says "Decay trust toward baseline deterministically"
            // Requirement: "Temporal trust decay toward baseline over time"
            // Let's use linear decay towards baseline capped by the gap.
            // Using a constant rate from invariants: DECAY_RATE_PER_HOUR

            double maxDecayAmount = TrustInvariants.DECAY_RATE_PER_HOUR * hoursElapsed;

            if (gap > 0) {
                // Current < Baseline (e.g. 20), we move up towards 50
                // Delta should be positive
                trustDeltaVal = Math.min(gap, maxDecayAmount);
            } else {
                // Current > Baseline (e.g. 80), we move down towards 50
                // Delta should be negative (maxDecayAmount is positive, so we negation)
                // We want to subtract maxDecayAmount, but not overshoot target
                // gap is negative.
                trustDeltaVal = Math.max(gap, -maxDecayAmount);
            }
        }

        // 2. Calculate Confidence Decay
        // Confidence always decays towards 0 (uncertainty increases) or just lowers?
        // "Decay confidence slower than trust"
        // Let's assume confidence decays towards MIN_CONFIDENCE (0.0)
        // Rate: Let's pick a slow rate, e.g., 10% of trust decay rate or a fixed small
        // number.
        // Let's define a CONFIDENCE_DECAY_RATE in Invariants or here.
        // Let's use 0.01 per hour.

        double confidenceDecayRate = 0.01;
        double maxConfDecay = confidenceDecayRate * hoursElapsed;
        double currentConf = currentScore.getConfidence();
        double confDeltaVal = 0.0;

        if (currentConf > TrustInvariants.MIN_CONFIDENCE) {
            // we decay down
            confDeltaVal = -Math.min(currentConf - TrustInvariants.MIN_CONFIDENCE, maxConfDecay);
        }

        // 3. Rounding / Precision
        // To ensure determinism and avoid floating point noise, let's round to 4
        // decimal places
        trustDeltaVal = Math.round(trustDeltaVal * 10000.0) / 10000.0;
        confDeltaVal = Math.round(confDeltaVal * 10000.0) / 10000.0;

        if (Math.abs(trustDeltaVal) < 0.0001 && Math.abs(confDeltaVal) < 0.0001) {
            return TrustDelta.of(0.0, 0.0, "Decay negligible", TrustSource.DECAY, now);
        }

        String reason = String.format("Temporal decay over %.2f hours: trust %+.4f, confidence %+.4f",
                hoursElapsed, trustDeltaVal, confDeltaVal);

        return TrustDelta.of(trustDeltaVal, confDeltaVal, reason, TrustSource.DECAY, now);
    }
}
