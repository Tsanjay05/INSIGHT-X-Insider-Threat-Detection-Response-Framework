package com.insightx.trust.domain;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * Immutable, audit-grade provenance record for a trust evaluation.
 *
 * <p>
 * Designed to be deterministic and explainable – captures the inputs,
 * intermediate indicators, and policy outputs that led to a
 * {@link TrustDecision}.
 */
public final class ProvenanceRecord {

    /**
     * Deterministic identifier linking this provenance to a {@link TrustDecision}.
     */
    private final String decisionId;

    /**
     * Entity identifier evaluated by the trust engine.
     */
    private final String entityId;

    /**
     * Structured inputs and intermediate computation context.
     */
    private final Inputs inputs;

    /**
     * Risk indicators derived from inputs that contributed to the final score.
     */
    private final List<RiskIndicator> contributingIndicators;

    /**
     * Policy evaluation output, captured as an immutable snapshot.
     */
    private final PolicyOutput policyOutput;

    /**
     * Immutable timestamps (provided/derived deterministically from request
     * context).
     */
    private final Timestamps timestamps;

    /**
     * Versioned policy references applied during evaluation.
     */
    private final List<PolicyReference> policyReferences;

    public ProvenanceRecord(String decisionId,
            String entityId,
            Inputs inputs,
            List<RiskIndicator> contributingIndicators,
            PolicyOutput policyOutput,
            Timestamps timestamps,
            List<PolicyReference> policyReferences) {
        this.decisionId = Objects.requireNonNull(decisionId, "decisionId must not be null");
        this.entityId = Objects.requireNonNull(entityId, "entityId must not be null");
        this.inputs = Objects.requireNonNull(inputs, "inputs must not be null");
        this.contributingIndicators = contributingIndicators == null ? List.of() : List.copyOf(contributingIndicators);
        this.policyOutput = Objects.requireNonNull(policyOutput, "policyOutput must not be null");
        this.timestamps = Objects.requireNonNull(timestamps, "timestamps must not be null");
        this.policyReferences = policyReferences == null ? List.of() : List.copyOf(policyReferences);
    }

    public String getDecisionId() {
        return decisionId;
    }

    public String getEntityId() {
        return entityId;
    }

    public Inputs getInputs() {
        return inputs;
    }

    public List<RiskIndicator> getContributingIndicators() {
        return contributingIndicators;
    }

    public PolicyOutput getPolicyOutput() {
        return policyOutput;
    }

    public Timestamps getTimestamps() {
        return timestamps;
    }

    public List<PolicyReference> getPolicyReferences() {
        return policyReferences;
    }

    /**
     * Structured evaluation inputs and intermediate context required for
     * post-factum explanation.
     */
    public record Inputs(
            Instant evaluationTimestamp,
            TrustScore priorTrustScore,
            Instant priorLastUpdated,
            RollingHistorySummary priorHistorySummary,
            TrustScore decayedBaselineTrustScore,
            List<String> scoringExplanation) {
        public Inputs {
            Objects.requireNonNull(evaluationTimestamp, "evaluationTimestamp must not be null");
            Objects.requireNonNull(priorTrustScore, "priorTrustScore must not be null");
            Objects.requireNonNull(priorLastUpdated, "priorLastUpdated must not be null");
            Objects.requireNonNull(priorHistorySummary, "priorHistorySummary must not be null");
            Objects.requireNonNull(decayedBaselineTrustScore, "decayedBaselineTrustScore must not be null");
            scoringExplanation = scoringExplanation == null ? List.of() : List.copyOf(scoringExplanation);
        }
    }

    /**
     * Policy output snapshot suitable for audit and downstream consumers.
     */
    public record PolicyOutput(
            RiskLevel riskLevel,
            boolean humanInLoopRequired,
            boolean allowAccess,
            boolean requireStepUpAuth,
            boolean requireSecurityReview,
            boolean requireCaseCreation,
            List<String> policyReasons) {
        public PolicyOutput {
            Objects.requireNonNull(riskLevel, "riskLevel must not be null");
            policyReasons = policyReasons == null ? List.of() : List.copyOf(policyReasons);
        }
    }

    /**
     * Immutable timestamps for audit. These are inputs (or deterministic
     * derivations) rather than wall-clock measurements.
     */
    public record Timestamps(
            Instant evaluationStartedAt,
            Instant evaluationCompletedAt) {
        public Timestamps {
            Objects.requireNonNull(evaluationStartedAt, "evaluationStartedAt must not be null");
            Objects.requireNonNull(evaluationCompletedAt, "evaluationCompletedAt must not be null");
            if (evaluationCompletedAt.isBefore(evaluationStartedAt)) {
                throw new IllegalArgumentException("evaluationCompletedAt must not be before evaluationStartedAt");
            }
        }
    }
}
