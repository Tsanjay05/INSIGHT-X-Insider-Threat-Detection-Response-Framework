package com.insightx.gateway.api;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TrustEvaluationRequestTest {

    @Test
    void shouldDefaultTimestampWhenNull() {
        TrustEvaluationRequest request = new TrustEvaluationRequest("test-entity", List.of(), null);
        assertNotNull(request.evaluationTimestamp());
    }

    @Test
    void shouldHandleNullSignalsList() {
        TrustEvaluationRequest request = new TrustEvaluationRequest("test-entity", null, Instant.now());
        assertNotNull(request.normalizedSignals());
        assertTrue(request.normalizedSignals().isEmpty());
    }

    @Test
    void shouldValidateNormalizedSignal() {
        assertThrows(IllegalArgumentException.class, () -> {
            new NormalizedSignal("id", "type", 1.5, 0.0, "desc", "src", Instant.now());
        });
    }

    @Test
    void shouldAcceptValidNormalizedSignal() {
        assertDoesNotThrow(() -> {
            new NormalizedSignal("id", "BEHAVIORAL", 0.5, 10.0, "desc", "src", Instant.now());
        });
    }
}
