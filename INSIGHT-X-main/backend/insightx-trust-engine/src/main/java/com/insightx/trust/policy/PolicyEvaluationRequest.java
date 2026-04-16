package com.insightx.trust.policy;

import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.domain.TrustScore;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * Input to policy evaluation. This is the contract boundary between trust computation and policy arbitration.
 */
public record PolicyEvaluationRequest(
        String entityId,
        TrustScore proposedTrustScore,
        List<RiskIndicator> contributingIndicators,
        Instant evaluationTimestamp
) {
    public PolicyEvaluationRequest {
        Objects.requireNonNull(entityId, "entityId must not be null");
        Objects.requireNonNull(proposedTrustScore, "proposedTrustScore must not be null");
        Objects.requireNonNull(evaluationTimestamp, "evaluationTimestamp must not be null");
        contributingIndicators = contributingIndicators == null ? List.of() : List.copyOf(contributingIndicators);
    }
}

