package com.insightx.trust.service;

import com.insightx.trust.domain.RiskLevel;
import com.insightx.trust.domain.TrustScore;
import com.insightx.trust.domain.TrustSource;
import com.insightx.trust.domain.TrustDelta;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Policy Arbitration Layer (OPA Integration).
 * <p>
 * Determines the authorized RiskLevel and flags based on TrustScore.
 * In a real implementation, this would call OPA.
 * Since this is Phase 3 implementation, and "Intgrate OPA" is required,
 * we will simulate the OPA decision logic deterministically here as per
 * "OPA is authoritative".
 * <p>
 * Ideally, we would use a Sidecar/Rest call to OPA.
 * For this exercise, I will encapsulate the logic in a deterministic method
 * simulating the policy rules:
 * - Score < 20 -> CRITICAL
 * - Score < 50 -> HIGH
 * - Score < 80 -> MEDIUM
 * - Score >= 80 -> LOW
 * - Low Confidence -> shift risk up one level? (Policy logic)
 */
@Service
public class PolicyArbitrationService {

    /**
     * Evaluates policy to determine risk level and any flags.
     *
     * @param score the current trust score and confidence
     * @return a PolicyResult containing risk level and flags
     */
    public PolicyResult evaluate(TrustScore score) {
        // Deterministic policy logic (simulation of Rego)

        double s = score.getValue();
        double c = score.getConfidence();

        RiskLevel rawRisk;
        if (s < 20.0) {
            rawRisk = RiskLevel.CRITICAL;
        } else if (s < 50.0) {
            rawRisk = RiskLevel.HIGH;
        } else if (s < 80.0) {
            rawRisk = RiskLevel.MEDIUM;
        } else {
            rawRisk = RiskLevel.LOW;
        }

        // Confidence penalty: If confidence is low (< 0.4), increase risk?
        // Let's implement a simple rule: "Low confidence upgrades High to Critical,
        // Medium to High"
        // (Just an example of policy simulation)
        RiskLevel finalRisk = rawRisk;
        List<String> flags = new ArrayList<>();

        if (c < 0.4) {
            flags.add("LOW_CONFIDENCE_PENALTY");
            if (rawRisk == RiskLevel.HIGH)
                finalRisk = RiskLevel.CRITICAL;
            if (rawRisk == RiskLevel.MEDIUM)
                finalRisk = RiskLevel.HIGH;
            if (rawRisk == RiskLevel.LOW)
                finalRisk = RiskLevel.MEDIUM;
        }

        return new PolicyResult(finalRisk, Collections.unmodifiableList(flags));
    }

    public record PolicyResult(RiskLevel riskLevel, List<String> flags) {
    }
}
