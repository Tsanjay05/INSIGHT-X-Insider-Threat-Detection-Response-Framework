package com.insightx.trust.service;

import com.insightx.trust.domain.TrustDelta;
import com.insightx.trust.domain.TrustScore;
import com.insightx.trust.domain.TrustSource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class TemporalTrustDecayEngineTest {

    private final TemporalTrustDecayEngine engine = new TemporalTrustDecayEngine();

    @Test
    public void testNoDecayForZeroTime() {
        Instant now = Instant.now();
        TrustScore currentScore = new TrustScore(80.0, 0.5);

        TrustDelta delta = engine.computeDecay(currentScore, now, now);

        Assertions.assertEquals(0.0, delta.getTrustDelta(), 0.0001);
        Assertions.assertEquals(0.0, delta.getConfidenceDelta(), 0.0001);
    }

    @Test
    public void testDecayTowardsBaselineFromAbove() {
        // Baseline 50. Rate 0.5/hr.
        // Start 80. Gap 30.
        // Elapsed 10 hours. Expected decay: 10 * 0.5 = 5.0.
        // Direction: Down (-).

        Instant start = Instant.parse("2025-01-01T10:00:00Z");
        Instant now = start.plus(10, ChronoUnit.HOURS);
        TrustScore currentScore = new TrustScore(80.0, 0.5);

        TrustDelta delta = engine.computeDecay(currentScore, start, now);

        Assertions.assertEquals(-5.0, delta.getTrustDelta(), 0.0001);
        Assertions.assertEquals(-0.1, delta.getConfidenceDelta(), 0.0001); // 0.01 * 10
        Assertions.assertEquals(TrustSource.DECAY, delta.getSource());
    }

    @Test
    public void testDecayTowardsBaselineFromBelow() {
        // Baseline 50. Rate 0.5/hr.
        // Start 20. Gap 30.
        // Elapsed 10 hours. Expected decay: 10 * 0.5 = 5.0.
        // Direction: Up (+).

        Instant start = Instant.parse("2025-01-01T10:00:00Z");
        Instant now = start.plus(10, ChronoUnit.HOURS);
        TrustScore currentScore = new TrustScore(20.0, 0.5);

        TrustDelta delta = engine.computeDecay(currentScore, start, now);

        Assertions.assertEquals(5.0, delta.getTrustDelta(), 0.0001);
        Assertions.assertEquals(-0.1, delta.getConfidenceDelta(), 0.0001); // Confidence always drops
    }

    @Test
    public void testDecayCappedByGap() {
        // Start 51. Gap 1.
        // Elapsed 10 hours. Potential decay 5.0.
        // Actual decay should be limited to 1.0 (to reach 50).

        Instant start = Instant.parse("2025-01-01T10:00:00Z");
        Instant now = start.plus(10, ChronoUnit.HOURS);
        TrustScore currentScore = new TrustScore(51.0, 0.5);

        TrustDelta delta = engine.computeDecay(currentScore, start, now);

        Assertions.assertEquals(-1.0, delta.getTrustDelta(), 0.0001);
    }

    @Test
    public void testConfidenceDecayFloor() {
        // Start Conf 0.05.
        // Elapsed 10 hours. Potential decay 0.1.
        // Actual decay should be -0.05 (to reach 0).

        Instant start = Instant.parse("2025-01-01T10:00:00Z");
        Instant now = start.plus(10, ChronoUnit.HOURS);
        TrustScore currentScore = new TrustScore(50.0, 0.05);

        TrustDelta delta = engine.computeDecay(currentScore, start, now);

        Assertions.assertEquals(-0.05, delta.getConfidenceDelta(), 0.0001);
    }

    @Test
    public void testInvalidTimeThrowsException() {
        Instant now = Instant.now();
        Instant future = now.plusSeconds(10);
        TrustScore currentScore = new TrustScore(50.0, 0.5);

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            engine.computeDecay(currentScore, future, now);
        });
    }
}
