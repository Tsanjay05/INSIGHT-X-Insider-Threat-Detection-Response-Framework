package com.insightx.trust.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * The final decision artifact produced by the Trust Engine.
 * Must be append-only persistable.
 */
public record TrustDecision(
        String decisionId,
        String entityId,
        TrustScore finalScore,
        RiskLevel riskLevel, // Enum
        List<String> policyFlags,
        List<TrustDelta> orderedDeltas,
        Instant decidedAt,
        TrustState resultingState) {
    public TrustDecision {
        Objects.requireNonNull(decisionId, "decisionId must not be null");
        Objects.requireNonNull(entityId, "entityId must not be null");
        Objects.requireNonNull(finalScore, "finalScore must not be null");
        Objects.requireNonNull(decidedAt, "decidedAt must not be null");
        Objects.requireNonNull(resultingState, "resultingState must not be null");
        
        // Defensive copies for immutability
        policyFlags = policyFlags != null ? List.copyOf(policyFlags) : List.of();
        orderedDeltas = orderedDeltas != null ? List.copyOf(orderedDeltas) : List.of();
    }

    // Compatibility methods for legacy controller
    public String getDecisionId() {
        return decisionId;
    }

    public String getEntityId() {
        return entityId;
    }

    public TrustScore getFinalTrustScore() {
        return finalScore;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public boolean isHumanInLoopRequired() {
        // Updated logic based on policy flags or risk level
        // Assuming user review required for CRITICAL risk or specific flags
        if (riskLevel == RiskLevel.CRITICAL)
            return true;
        List<String> flags = policyFlags();
        if (flags == null)
            return false;

        return flags.contains("HUMAN_REVIEW_REQUIRED") ||
                flags.contains("REQUIRE_SECURITY_REVIEW") ||
                flags.contains("requireSecurityReview");
    }

    public List<String> getExplanation() {
        if (orderedDeltas == null)
            return Collections.emptyList();
        return orderedDeltas.stream()
                .map(TrustDelta::getReason)
                .toList();
    }

    // Alias for getExplanation for compatibility
    public List<String> getReasons() {
        return getExplanation();
    }

    // Alias for policyFlags for compatibility
    public List<String> getAppliedPolicies() {
        return policyFlags != null ? policyFlags : Collections.emptyList();
    }
}
