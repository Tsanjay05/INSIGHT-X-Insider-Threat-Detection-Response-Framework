package com.insightx.trust;

import com.insightx.trust.algorithm.TemporalDecayCalculator;
import com.insightx.trust.algorithm.TrustScoringEngine;
import com.insightx.trust.domain.PolicyReference;
import com.insightx.trust.policy.OpaPolicyEvaluator;
import com.insightx.trust.policy.PolicyEvaluator;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Explicit wiring for core Trust Engine components.
 *
 * <p>
 * Domain and algorithms remain deterministic and framework-light; Spring is
 * used only for composition.
 */
@Configuration
public class TrustEngineConfiguration {

    @Bean
    public TemporalDecayCalculator temporalDecayCalculator() {
        // Explicit Phase 1 parameters:
        // - Drift toward neutral baseline 50 at max 0.25 points/hour (6 points/day)
        // - Confidence decays by 0.01/hour (0.24/day)
        return new TemporalDecayCalculator(50.0, 0.25, 0.01);
    }

    @Bean
    public TrustScoringEngine trustScoringEngine() {
        // Negative change rate limit per evaluation (Phase 1 explicit bound).
        return new TrustScoringEngine(15.0);
    }

    @Bean
    public PolicyEvaluator policyEvaluator(com.insightx.trust.policy.OpaClient opaClient) {
        // Phase 1: OPA stub with versioned policy references.
        PolicyReference riskThresholds = new PolicyReference(
                "opa/risk_thresholds",
                "1.0.0",
                "sha256:0000000000000000000000000000000000000000000000000000000000000000");
        PolicyReference humanInLoop = new PolicyReference(
                "opa/human_in_loop",
                "1.0.0",
                "sha256:0000000000000000000000000000000000000000000000000000000000000000");
        return new OpaPolicyEvaluator(riskThresholds, humanInLoop, opaClient);
    }
}
