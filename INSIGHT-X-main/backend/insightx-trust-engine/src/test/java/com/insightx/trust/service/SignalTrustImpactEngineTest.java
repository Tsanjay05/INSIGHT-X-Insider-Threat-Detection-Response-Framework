package com.insightx.trust.service;

import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.domain.TrustDelta;
import com.insightx.trust.domain.TrustSource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.Instant;

public class SignalTrustImpactEngineTest {

    private final SignalTrustImpactEngine engine = new SignalTrustImpactEngine();

    @Test
    public void testPositiveContribution() {
        // High severity (1.0). Contribution +10.0.
        // Expected Conf Boost: 0.01 + (0.05 * 1.0) = 0.06.

        NormalizedSignal signal = new NormalizedSignal(
                "sig-1",
                RiskIndicator.Type.BEHAVIORAL,
                1.0,
                10.0,
                "Good behavior",
                "UBA",
                Instant.now());

        TrustDelta delta = engine.computeImpact(signal);

        Assertions.assertEquals(10.0, delta.getTrustDelta(), 0.0001);
        Assertions.assertEquals(0.06, delta.getConfidenceDelta(), 0.0001);
        Assertions.assertEquals(TrustSource.SIGNAL, delta.getSource());
    }

    @Test
    public void testNegativeContribution() {
        // Medium severity (0.5). Contribution -20.0.
        // Expected Conf Boost: 0.01 + (0.05 * 0.5) = 0.01 + 0.025 = 0.035.

        NormalizedSignal signal = new NormalizedSignal(
                "sig-2",
                RiskIndicator.Type.DATA_ACCESS,
                0.5,
                -20.0,
                "Bad behavior",
                "DLP",
                Instant.now());

        TrustDelta delta = engine.computeImpact(signal);

        Assertions.assertEquals(-20.0, delta.getTrustDelta(), 0.0001);
        Assertions.assertEquals(0.035, delta.getConfidenceDelta(), 0.0001);
    }

    @Test
    public void testNullSignal() {
        Assertions.assertThrows(NullPointerException.class, () -> {
            engine.computeImpact(null);
        });
    }
}
