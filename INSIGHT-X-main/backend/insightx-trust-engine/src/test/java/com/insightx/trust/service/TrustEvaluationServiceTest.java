package com.insightx.trust.service;

import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.*;

/**
 * Deterministic tests for TrustEvaluationService (Phase 3).
 * Uses mocks for persistence layer to ensure determinism.
 */
public class TrustEvaluationServiceTest {

    private TrustEvaluationService service;
    private MockTrustStateRepository stateRepository;
    private MockTrustDecisionRepository decisionRepository;
    private MockProvenanceRepository provenanceRepository;
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @BeforeEach
    @SuppressWarnings("unchecked")
    public void setup() {
        stateRepository = new MockTrustStateRepository();
        decisionRepository = new MockTrustDecisionRepository();
        provenanceRepository = new MockProvenanceRepository();
        kafkaTemplate = mock(org.springframework.kafka.core.KafkaTemplate.class);

        TemporalTrustDecayEngine decayEngine = new TemporalTrustDecayEngine();
        SignalTrustImpactEngine signalEngine = new SignalTrustImpactEngine();
        PolicyArbitrationService policyService = new PolicyArbitrationService();

        service = new TrustEvaluationService(
                stateRepository,
                decisionRepository,
                provenanceRepository,
                decayEngine,
                signalEngine,
                policyService,
                kafkaTemplate);
    }

    @Test
    public void testFirstTimeEvaluation() {
        String entityId = "user-123";
        Instant now = Instant.parse("2025-01-01T10:00:00Z");

        NormalizedSignal signal = new NormalizedSignal(
                "sig-1",
                RiskIndicator.Type.DATA_ACCESS,
                0.5,
                -10.0,
                "Suspicious Access",
                "DLP",
                now);

        var request = new com.insightx.trust.api.EvaluateTrustRequest(
                entityId,
                List.of(signal),
                now);

        StepVerifier.create(service.evaluate(request))
                .assertNext(decision -> {
                    // Initial score 50.
                    // Signal: -10.
                    // New score: 40.
                    Assertions.assertEquals(40.0, decision.getFinalTrustScore().getValue(), 0.0001);
                    Assertions.assertEquals(entityId, decision.getEntityId());
                    Assertions.assertNotNull(decision.getDecisionId());

                    // Verify Persistence
                    Assertions.assertTrue(stateRepository.saved);
                    Assertions.assertTrue(decisionRepository.saved);
                    Assertions.assertTrue(provenanceRepository.saved);
                })
                .verifyComplete();
    }

    @Test
    public void testDecayAndSignal() {
        String entityId = "user-decay";
        Instant now = Instant.parse("2025-01-01T12:00:00Z"); // 2 hours later
        Instant priorTime = Instant.parse("2025-01-01T10:00:00Z");

        TrustScore priorScore = new TrustScore(20.0, 0.5);
        TrustState priorState = new TrustState(entityId, priorScore, priorTime, RollingHistorySummary.empty(priorTime));
        stateRepository.store(priorState);

        // Signal: +5.0 (Positive behavior)
        NormalizedSignal signal = new NormalizedSignal(
                "sig-2",
                RiskIndicator.Type.BEHAVIORAL,
                0.1,
                5.0,
                "Good behavior",
                "UBA",
                now);

        var request = new com.insightx.trust.api.EvaluateTrustRequest(
                entityId,
                List.of(signal),
                now);

        StepVerifier.create(service.evaluate(request))
                .assertNext(decision -> {
                    // Decay: 20 -> 21 (+1.0)
                    // Signal: +5.0
                    // Total: 26.0
                    Assertions.assertEquals(26.0, decision.getFinalTrustScore().getValue(), 0.0001);
                    Assertions.assertEquals(RiskLevel.HIGH, decision.getRiskLevel()); // 26 is High (<50)
                })
                .verifyComplete();
    }

    // Mocks for persistence package interfaces
    static class MockTrustStateRepository implements com.insightx.trust.persistence.TrustStateRepository {
        boolean saved = false;
        TrustState stored;

        void store(TrustState state) {
            this.stored = state;
        }

        @Override
        public reactor.core.publisher.Mono<TrustState> findByEntityId(String entityId) {
            if (stored != null && stored.getEntityId().equals(entityId))
                return reactor.core.publisher.Mono.just(stored);
            return reactor.core.publisher.Mono.empty();
        }

        @Override
        public reactor.core.publisher.Mono<TrustState> upsert(TrustState entity) {
            this.saved = true;
            this.stored = entity;
            return reactor.core.publisher.Mono.just(entity);
        }
    }

    static class MockTrustDecisionRepository implements com.insightx.trust.persistence.TrustDecisionRepository {
        boolean saved = false;

        @Override
        public reactor.core.publisher.Mono<Void> append(TrustDecision entity) {
            this.saved = true;
            return reactor.core.publisher.Mono.empty();
        }

        @Override
        public reactor.core.publisher.Flux<TrustDecision> findByEntityIdOrderByTimestampDesc(String entityId) {
            // Return empty flux for test mock - can be extended if needed for specific
            // tests
            return reactor.core.publisher.Flux.empty();
        }
    }

    static class MockProvenanceRepository implements com.insightx.trust.persistence.ProvenanceRepository {
        boolean saved = false;

        @Override
        public reactor.core.publisher.Mono<Void> append(ProvenanceRecord record) {
            this.saved = true;
            return reactor.core.publisher.Mono.empty();
        }
    }
}
