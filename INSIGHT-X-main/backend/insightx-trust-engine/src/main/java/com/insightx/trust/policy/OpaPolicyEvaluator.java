package com.insightx.trust.policy;

import com.insightx.trust.domain.PolicyReference;
import com.insightx.trust.domain.RiskLevel;

import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;

/**
 * OPA-backed policy evaluator.
 */
public final class OpaPolicyEvaluator implements PolicyEvaluator {

    private final PolicyReference policyRiskThresholds;
    private final PolicyReference policyHumanInLoop;
    private final OpaClient opaClient;

    public OpaPolicyEvaluator(PolicyReference policyRiskThresholds, PolicyReference policyHumanInLoop,
            OpaClient opaClient) {
        this.policyRiskThresholds = policyRiskThresholds;
        this.policyHumanInLoop = policyHumanInLoop;
        this.opaClient = opaClient;
    }

    @Override
    public Mono<PolicyDecision> evaluate(PolicyEvaluationRequest request) {
        Map<String, Object> input = Map.of(
                "trust_score", request.proposedTrustScore().getValue(),
                "indicators", request.contributingIndicators());

        return Mono.zip(
                opaClient.evaluate("insightx/risk", input),
                opaClient.evaluate("insightx/human_in_loop", input)).map(tuple -> {
                    com.fasterxml.jackson.databind.JsonNode riskResult = tuple.getT1();
                    com.fasterxml.jackson.databind.JsonNode humanResult = tuple.getT2();

                    RiskLevel riskLevel = parseRiskLevel(riskResult.path("risk_level").asText("LOW"));
                    boolean humanInLoopRequired = humanResult.path("required").asBoolean(false);
                    boolean isFallback = riskResult.has("fallback") || humanResult.has("fallback");

                    List<String> reasons = new java.util.ArrayList<>();
                    if (isFallback)
                        reasons.add("WARNING: OPA Unavailable - Using Fallback Policy");
                    reasons.add("Risk derived from OPA: " + riskLevel);
                    reasons.add("Human approval: " + (humanInLoopRequired ? "REQUIRED" : "NOT_REQUIRED"));

                    // PolicyFlags(allowed, stepUp, review, case, additional)
                    Map<String, Boolean> additionalFlags = new java.util.HashMap<>();
                    if (isFallback)
                        additionalFlags.put("policyFallback", true);

                    PolicyFlags flags = new PolicyFlags(
                            true,
                            riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL,
                            humanInLoopRequired,
                            riskLevel == RiskLevel.CRITICAL,
                            additionalFlags);

                    return new PolicyDecision(
                            riskLevel,
                            humanInLoopRequired,
                            List.of(policyRiskThresholds, policyHumanInLoop),
                            flags,
                            reasons);
                });
    }

    private RiskLevel parseRiskLevel(String level) {
        try {
            return RiskLevel.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            return RiskLevel.LOW;
        }
    }
}
