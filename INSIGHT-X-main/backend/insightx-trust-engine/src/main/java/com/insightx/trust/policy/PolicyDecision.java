package com.insightx.trust.policy;

import com.insightx.trust.domain.PolicyReference;
import com.insightx.trust.domain.RiskLevel;

import java.util.List;
import java.util.Objects;

/**
 * Immutable policy evaluation result.
 *
 * <p>
 * In INSIGHT-X, policy is authoritative (OPA). The trust engine computes
 * evidence,
 * and policy determines the resulting risk level and obligations (including
 * human-in-the-loop).
 */
public record PolicyDecision(
        RiskLevel riskLevel,
        boolean humanInLoopRequired,
        List<PolicyReference> appliedPolicies,
        PolicyFlags policyFlags,
        List<String> reasons) {
    public PolicyDecision {
        Objects.requireNonNull(riskLevel, "riskLevel must not be null");
        Objects.requireNonNull(policyFlags, "policyFlags must not be null");
        appliedPolicies = appliedPolicies == null ? List.of() : List.copyOf(appliedPolicies);
        reasons = reasons == null ? List.of() : List.copyOf(reasons);
    }
}
