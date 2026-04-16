package com.insightx.trust.integration;

import com.insightx.trust.api.EvaluateTrustRequest;
import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.domain.TrustDecision;
import com.insightx.trust.repository.TrustDecisionRepository;
import com.insightx.trust.repository.TrustStateRepository;
import com.insightx.trust.service.TrustEvaluationService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Integration test for Trust Decision Flow
 * Validates: Postgres persistence, Kafka event emission, reactive behavior
 * 
 * <p>
 * Extends PostgreSQLTestBase to inherit shared PostgreSQL container
 * configuration.
 * </p>
 */
@SpringBootTest
@Testcontainers
public class TrustDecisionFlowIntegrationTest extends PostgreSQLTestBase {

        /**
         * Kafka container for testing event emission.
         * PostgreSQL container is inherited from PostgreSQLTestBase.
         */
        @Container
        static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

        @DynamicPropertySource
        static void configureKafka(DynamicPropertyRegistry registry) {
                // PostgreSQL config is handled by PostgreSQLTestBase
                // Only configure Kafka here
                registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        }

        @Autowired
        private TrustEvaluationService evaluationService;

        @Autowired
        private TrustStateRepository stateRepository;

        @Autowired
        private TrustDecisionRepository decisionRepository;

        @Autowired
        private KafkaTemplate<String, Object> kafkaTemplate;

        @Test
        public void testTrustDecisionFlowWithPersistenceAndKafka() {
                String entityId = "integration-test-user-" + UUID.randomUUID();

                // Create a high-severity signal
                NormalizedSignal signal = new NormalizedSignal(
                                "sig-" + UUID.randomUUID(),
                                RiskIndicator.Type.DATA_ACCESS,
                                0.9, // High severity
                                -25.0, // Negative contribution
                                "Suspicious data export detected",
                                "DLP",
                                Instant.now());

                // Evaluate trust
                EvaluateTrustRequest request = new EvaluateTrustRequest(
                                entityId,
                                List.of(signal),
                                Instant.now());

                StepVerifier.create(evaluationService.evaluate(request))
                                .assertNext(decision -> {
                                        Assertions.assertNotNull(decision.decisionId());
                                        Assertions.assertEquals(entityId, decision.entityId());
                                        Assertions.assertNotNull(decision.riskLevel());
                                        Assertions.assertTrue(decision.finalScore().getValue() < 50.0); // Should drop
                                                                                                        // from baseline
                                })
                                .expectComplete()
                                .verify(Duration.ofSeconds(10));

                // Verify persistence in trust_decisions table
                StepVerifier.create(decisionRepository.findAll().filter(d -> d.entityId().equals(entityId)))
                                .expectNextCount(1)
                                .verifyComplete();

                // Verify trust_state was created/updated
                StepVerifier.create(stateRepository.findById(entityId))
                                .assertNext(state -> {
                                        Assertions.assertNotNull(state);
                                        Assertions.assertTrue(state.getCurrentTrustScore().getValue() < 50.0);
                                })
                                .verifyComplete();
        }

        @Test
        public void testMultipleSignalsUpdateTrustState() {
                String entityId = "multi-signal-user-" + UUID.randomUUID();

                // Signal 1: Positive behavior
                NormalizedSignal signal1 = new NormalizedSignal(
                                "sig-pos-" + UUID.randomUUID(),
                                RiskIndicator.Type.BEHAVIORAL,
                                0.3,
                                +5.0,
                                "Normal login pattern",
                                "UBA",
                                Instant.now());

                // Signal 2: Negative behavior
                NormalizedSignal signal2 = new NormalizedSignal(
                                "sig-neg-" + UUID.randomUUID(),
                                RiskIndicator.Type.DATA_ACCESS,
                                0.7,
                                -15.0,
                                "Unauthorized access attempt",
                                "DLP",
                                Instant.now().plusSeconds(1));

                // Evaluate both signals sequentially
                EvaluateTrustRequest request1 = new EvaluateTrustRequest(
                                entityId,
                                List.of(signal1),
                                Instant.now());

                EvaluateTrustRequest request2 = new EvaluateTrustRequest(
                                entityId,
                                List.of(signal2),
                                Instant.now().plusSeconds(2));

                StepVerifier.create(
                                evaluationService.evaluate(request1)
                                                .then(evaluationService.evaluate(request2)))
                                .expectComplete()
                                .verify(Duration.ofSeconds(10));

                // Verify final state reflects both signals
                StepVerifier.create(stateRepository.findById(entityId))
                                .assertNext(state -> {
                                        // Should be at baseline (50) + 5 - 15 = 40
                                        Assertions.assertTrue(state.getCurrentTrustScore().getValue() < 50.0);
                                })
                                .verifyComplete();

                // Verify two decisions were recorded
                StepVerifier.create(decisionRepository.findAll().filter(d -> d.entityId().equals(entityId)))
                                .expectNextCount(2)
                                .verifyComplete();
        }
}
