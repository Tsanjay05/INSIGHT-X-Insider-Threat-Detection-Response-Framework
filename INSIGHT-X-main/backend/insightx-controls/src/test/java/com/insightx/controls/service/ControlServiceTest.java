package com.insightx.controls.service;

import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.controls.domain.AdaptiveControl.ControlStatus;
import com.insightx.controls.domain.AdaptiveControl.ControlType;
import com.insightx.controls.repository.AdaptiveControlRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.kafka.core.KafkaTemplate;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class ControlServiceTest {

    private AdaptiveControlRepository repository;
    private KafkaTemplate<String, Object> kafkaTemplate;
    private ControlService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    public void setup() {
        repository = mock(AdaptiveControlRepository.class);
        kafkaTemplate = mock(KafkaTemplate.class);
        // Kafka send returns CompletableFuture in newer Spring, or ListenableFuture in
        // older.
        // Assuming newer Spring Boot 3.2.0.
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(CompletableFuture.completedFuture(null));

        service = new ControlService(repository, kafkaTemplate);
    }

    @Test
    public void testApplyControlCreatesNewWhenNoneActive() {
        String entityId = "user-1";
        ControlType type = ControlType.STEP_UP_AUTH;

        when(repository.findByEntityIdAndStatus(entityId, ControlStatus.ACTIVE)).thenReturn(Flux.empty());
        when(repository.save(any(AdaptiveControl.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.applyControl(entityId, type, "dec-1", "pol-1", "v1", "hash", "reason"))
                .assertNext(c -> {
                    Assertions.assertEquals(ControlStatus.ACTIVE, c.status());
                    Assertions.assertEquals(type, c.controlType());
                })
                .verifyComplete();

        verify(kafkaTemplate).send(eq("control-events"), eq(entityId), any(AdaptiveControl.class));
    }

    @Test
    public void testApplyControlIdempotent() {
        String entityId = "user-1";
        ControlType type = ControlType.STEP_UP_AUTH;

        AdaptiveControl existing = new AdaptiveControl(
                "ctrl-1",
                entityId,
                type,
                "dec-0",
                "pol-1",
                "v1",
                "hash",
                ControlStatus.ACTIVE,
                Instant.now().plusSeconds(3600),
                Instant.now(),
                "reason",
                null, null, null);

        when(repository.findByEntityIdAndStatus(entityId, ControlStatus.ACTIVE)).thenReturn(Flux.just(existing));
        // Add fallback to prevent NPE even if reactive path misbehaves
        when(repository.save(any(AdaptiveControl.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.applyControl(entityId, type, "dec-1", "pol-1", "v1", "hash", "reason"))
                .assertNext(c -> {
                    // Should return existing
                    Assertions.assertEquals("ctrl-1", c.controlId());
                })
                .verifyComplete();

        // Should NOT save new control
        verify(repository, never()).save(any());
        // Should NOT send event (assuming only on change/creation)
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    public void testRevokeControl() {
        String controlId = "ctrl-1";

        AdaptiveControl existing = new AdaptiveControl(
                controlId,
                "user-1",
                ControlType.BLOCK_ACCESS,
                "dec-0",
                "pol-1",
                "v1",
                "hash",
                ControlStatus.ACTIVE,
                Instant.now().plusSeconds(3600),
                Instant.now(),
                "reason",
                null, null, null);

        when(repository.findById(controlId)).thenReturn(Mono.just(existing));
        when(repository.save(any(AdaptiveControl.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.revokeControl(controlId, "User appealed"))
                .assertNext(c -> {
                    Assertions.assertEquals(ControlStatus.REVOKED, c.status());
                    Assertions.assertNotNull(c.revokedAt());
                    Assertions.assertEquals("User appealed", c.revokedReason());
                })
                .verifyComplete();

        verify(kafkaTemplate).send(eq("control-events"), eq("user-1"), any(AdaptiveControl.class));
    }
}
