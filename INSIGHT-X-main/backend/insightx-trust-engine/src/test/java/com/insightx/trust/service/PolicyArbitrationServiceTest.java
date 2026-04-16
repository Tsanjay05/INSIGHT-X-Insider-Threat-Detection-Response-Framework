package com.insightx.trust.service;

import com.insightx.trust.domain.RiskLevel;
import com.insightx.trust.domain.TrustScore;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

public class PolicyArbitrationServiceTest {

    private final PolicyArbitrationService service = new PolicyArbitrationService();

    @Test
    public void testCriticalRisk() {
        TrustScore score = new TrustScore(10.0, 0.8);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);
        Assertions.assertEquals(RiskLevel.CRITICAL, result.riskLevel());
    }

    @Test
    public void testHighRisk() {
        TrustScore score = new TrustScore(49.0, 0.8);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);
        Assertions.assertEquals(RiskLevel.HIGH, result.riskLevel());
    }

    @Test
    public void testMediumRisk() {
        TrustScore score = new TrustScore(60.0, 0.8);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);
        Assertions.assertEquals(RiskLevel.MEDIUM, result.riskLevel());
    }

    @Test
    public void testLowRisk() {
        TrustScore score = new TrustScore(80.0, 0.8);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);
        Assertions.assertEquals(RiskLevel.LOW, result.riskLevel());
    }

    @Test
    public void testConfidencePenaltyUpdatesRisk() {
        // High risk (40.0) with Low Confidence (0.3).
        // Should upgrade to CRITICAL.
        TrustScore score = new TrustScore(40.0, 0.3);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);

        Assertions.assertEquals(RiskLevel.CRITICAL, result.riskLevel());
        Assertions.assertTrue(result.flags().contains("LOW_CONFIDENCE_PENALTY"));
    }

    @Test
    public void testLowConfidenceDoesNotDowngradeCritical() {
        // Already Critical (10.0) with Low Conf (0.3).
        // Remains Critical.
        TrustScore score = new TrustScore(10.0, 0.3);
        PolicyArbitrationService.PolicyResult result = service.evaluate(score);

        Assertions.assertEquals(RiskLevel.CRITICAL, result.riskLevel());
    }
}
