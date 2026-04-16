package com.insightx.trust.algorithm;

import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.domain.TrustScore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Deterministic scoring engine that applies normalized risk indicators cumulatively.
 *
 * <p>
 * Rules (Phase 1):
 * - Indicators apply cumulatively via (contribution * severity)
 * - Negative trust change is rate-limited per evaluation
 * - Confidence decreases with sparse or conflicting signals
 */
public final class TrustScoringEngine {

    private final double maxNegativeDeltaPerEvaluation;

    public TrustScoringEngine(double maxNegativeDeltaPerEvaluation) {
        if (Double.isNaN(maxNegativeDeltaPerEvaluation) || Double.isInfinite(maxNegativeDeltaPerEvaluation) || maxNegativeDeltaPerEvaluation < 0.0) {
            throw new IllegalArgumentException("maxNegativeDeltaPerEvaluation must be a finite number >= 0");
        }
        this.maxNegativeDeltaPerEvaluation = maxNegativeDeltaPerEvaluation;
    }

    public TrustComputationResult compute(TrustScore baseline, List<RiskIndicator> indicators) {
        Objects.requireNonNull(baseline, "baseline must not be null");
        List<RiskIndicator> safeIndicators = indicators == null ? List.of() : List.copyOf(indicators);

        double rawDelta = 0.0;
        double positiveAbs = 0.0;
        double negativeAbs = 0.0;

        for (RiskIndicator indicator : safeIndicators) {
            double term = indicator.getContribution() * indicator.getSeverity();
            rawDelta += term;
            double abs = Math.abs(term);
            if (term >= 0) {
                positiveAbs += abs;
            } else {
                negativeAbs += abs;
            }
        }

        double appliedDelta = rawDelta;
        if (appliedDelta < 0.0) {
            appliedDelta = Math.max(appliedDelta, -maxNegativeDeltaPerEvaluation);
        }

        double computedValue = clamp0to100(baseline.getValue() + appliedDelta);

        double computedConfidence = computeConfidence(safeIndicators, positiveAbs, negativeAbs);

        List<String> explanation = new ArrayList<>();
        explanation.add("Baseline trust score=" + baseline.getValue() + ", confidence=" + baseline.getConfidence());
        explanation.add("Raw indicator delta=" + rawDelta + " (appliedDelta=" + appliedDelta + ", negativeRateLimit=" + maxNegativeDeltaPerEvaluation + ")");

        safeIndicators.stream()
                .sorted(Comparator.comparingDouble((RiskIndicator ri) -> Math.abs(ri.getContribution() * ri.getSeverity())).reversed())
                .limit(10)
                .forEach(ri -> explanation.add("Indicator[" + ri.getId() + "] type=" + ri.getType()
                        + " severity=" + ri.getSeverity()
                        + " contribution=" + ri.getContribution()
                        + " term=" + (ri.getContribution() * ri.getSeverity())
                        + " source=" + ri.getSource()));

        explanation.add("Computed trust score=" + computedValue + ", computed confidence=" + computedConfidence);

        return new TrustComputationResult(
                new TrustScore(computedValue, computedConfidence),
                rawDelta,
                appliedDelta,
                maxNegativeDeltaPerEvaluation,
                explanation
        );
    }

    private double computeConfidence(List<RiskIndicator> indicators, double positiveAbs, double negativeAbs) {
        int n = indicators.size();

        // Sparse signals: fewer indicators reduces confidence.
        double sparsePenalty;
        if (n == 0) {
            sparsePenalty = 0.60;
        } else if (n == 1) {
            sparsePenalty = 0.35;
        } else if (n == 2) {
            sparsePenalty = 0.20;
        } else {
            sparsePenalty = 0.0;
        }

        // Conflicting signals: simultaneous strong positive and strong negative reduces confidence.
        double conflictPenalty = 0.0;
        if (positiveAbs > 0.0 && negativeAbs > 0.0) {
            double ratio = Math.min(positiveAbs, negativeAbs) / Math.max(positiveAbs, negativeAbs); // [0,1]
            conflictPenalty = 0.30 * ratio;
        }

        // Default prior confidence for Phase 1: we are explicit about uncertainty.
        double base = 0.85;

        return clamp0to1(base - sparsePenalty - conflictPenalty);
    }

    private double clamp0to100(double v) {
        return Math.max(0.0, Math.min(100.0, v));
    }

    private double clamp0to1(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }
}

