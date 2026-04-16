package com.insightx.trust.api;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Response payload returned by the Trust Engine after evaluation.
 */
public record EvaluateTrustResponse(
        String decisionId,
        String entityId,
        double trustScore,
        double confidence,
        String riskLevel,
        Map<String, Boolean> policyFlags,
        boolean humanInLoopRequired,
        List<String> explanation
) {
    public EvaluateTrustResponse {
        Objects.requireNonNull(decisionId, "decisionId must not be null");
        Objects.requireNonNull(entityId, "entityId must not be null");
        Objects.requireNonNull(riskLevel, "riskLevel must not be null");
        policyFlags = policyFlags == null ? Map.of() : Map.copyOf(policyFlags);
        explanation = explanation == null ? List.of() : List.copyOf(explanation);
    }
}

