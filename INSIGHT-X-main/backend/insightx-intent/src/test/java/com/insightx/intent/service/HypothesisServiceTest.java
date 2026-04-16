package com.insightx.intent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.intent.domain.IntentHypothesis;
import com.insightx.intent.domain.IntentHypothesis.HypothesisType;
import com.insightx.intent.repository.IntentHypothesisRepository;
import io.r2dbc.postgresql.codec.Json;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class HypothesisServiceTest {

    private IntentHypothesisRepository repository;
    private HypothesisService service;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        repository = mock(IntentHypothesisRepository.class);
        objectMapper = new ObjectMapper();
        service = new HypothesisService(repository, objectMapper);
    }

    @Test
    public void testCreateHypothesisWhenNoneExists() {
        String entityId = "user-1";
        HypothesisType type = HypothesisType.BENIGN_ROLE_EXPANSION;
        double scoreChange = 0.2;
        String evidence = "Permissions added";

        when(repository.findAll()).thenReturn(Flux.empty());
        when(repository.save(any(IntentHypothesis.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.updateHypothesis(entityId, type, scoreChange, evidence))
                .assertNext(h -> {
                    Assertions.assertEquals(entityId, h.getEntityId());
                    Assertions.assertEquals(type, h.getType());
                    Assertions.assertEquals(0.2, h.getConfidenceScore(), 0.0001);
                })
                .verifyComplete();
    }

    @Test
    public void testUpdateExistingHypothesis() {
        String entityId = "user-1";
        HypothesisType type = HypothesisType.MALICIOUS_INSIDER;

        // Mock existing
        IntentHypothesis existing = new IntentHypothesis(
                UUID.randomUUID(),
                entityId,
                type,
                0.5,
                Json.of("[]"),
                Json.of("{}"),
                Instant.now(),
                Instant.now());

        when(repository.findAll()).thenReturn(Flux.just(existing));
        when(repository.save(any(IntentHypothesis.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.updateHypothesis(entityId, type, 0.3, "Anomaly detected"))
                .assertNext(h -> {
                    Assertions.assertEquals(0.8, h.getConfidenceScore(), 0.0001); // 0.5 + 0.3
                })
                .verifyComplete();
    }

    @Test
    public void testScoreCapAtOne() {
        String entityId = "user-1";
        HypothesisType type = HypothesisType.CREDENTIAL_COMPROMISE;

        IntentHypothesis existing = new IntentHypothesis(
                UUID.randomUUID(),
                entityId,
                type,
                0.9,
                Json.of("[]"),
                Json.of("{}"),
                Instant.now(),
                Instant.now());

        when(repository.findAll()).thenReturn(Flux.just(existing));
        when(repository.save(any(IntentHypothesis.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.updateHypothesis(entityId, type, 0.2, "New evidence"))
                .assertNext(h -> {
                    Assertions.assertEquals(1.0, h.getConfidenceScore(), 0.0001); // 0.9 + 0.2 capped
                })
                .verifyComplete();
    }
}
