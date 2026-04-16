package com.insightx.gateway.api;

import java.util.List;
import java.util.Map;

public record TrustEvaluationResponse(
        Decision decision,
        Map<String, Boolean> policyFlags,
        List<String> explanation) {
    public record Decision(
            String decisionId,
            String entityId,
            TrustScore finalTrustScore,
            String riskLevel,
            List<PolicyReference> appliedPolicies,
            boolean humanInLoopRequired,
            List<String> reasons) {
    }

    public record TrustScore(
            double value,
            double confidence) {
    }

    public record PolicyReference(
            String policyId,
            String version,
            String contentHash) {
    }
}
