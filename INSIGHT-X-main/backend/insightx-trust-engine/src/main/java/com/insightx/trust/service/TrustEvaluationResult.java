package com.insightx.trust.service;

import com.insightx.trust.domain.TrustDecision;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service-layer evaluation result that includes decision plus policy flags and explanation.
 */
public record TrustEvaluationResult(
        TrustDecision decision,
        Map<String, Boolean> policyFlags,
        List<String> explanation
) {
    public TrustEvaluationResult {
        Objects.requireNonNull(decision, "decision must not be null");
        policyFlags = policyFlags == null ? Map.of() : Map.copyOf(policyFlags);
        explanation = explanation == null ? List.of() : List.copyOf(explanation);
    }
}

