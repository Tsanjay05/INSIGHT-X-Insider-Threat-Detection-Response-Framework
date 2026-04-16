package com.insightx.controls.service;

import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.controls.domain.AdaptiveControl.ControlStatus;
import com.insightx.controls.domain.AdaptiveControl.ControlType;
import com.insightx.controls.repository.AdaptiveControlRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class ControlService {

    private static final Logger logger = LoggerFactory.getLogger(ControlService.class);
    private final AdaptiveControlRepository repository;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    public ControlService(AdaptiveControlRepository repository,
            org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public Mono<AdaptiveControl> applyControl(String entityId, ControlType type, String decisionId, String policyId,
            String policyVersion, String policyHash, String reason) {
        // Idempotency: Check if active control of same type exists
        return repository.findByEntityIdAndStatus(entityId, ControlStatus.ACTIVE)
                .filter(c -> c.controlType() == type)
                .next()
                .flatMap(existing -> {
                    logger.info("Control {} already active for entity {}", type, entityId);
                    // Check if new decision supersedes (omitted for brevity, assume idempotency)
                    return Mono.just(existing);
                })
                .switchIfEmpty(
                        createControl(entityId, type, decisionId, policyId, policyVersion, policyHash, reason));
    }

    public Mono<AdaptiveControl> revokeControl(String controlId, String revokedReason) {
        return repository.findById(controlId)
                .flatMap(control -> {
                    if (control.status() != ControlStatus.ACTIVE) {
                        return Mono.just(control);
                    }
                    AdaptiveControl revoked = new AdaptiveControl(
                            control.controlId(),
                            control.entityId(),
                            control.controlType(),
                            control.triggerDecisionId(),
                            control.policyId(),
                            control.policyVersion(),
                            control.policyHash(),
                            ControlStatus.REVOKED,
                            control.expiresAt(),
                            control.createdAt(),
                            control.triggerReason(),
                            Instant.now(),
                            revokedReason,
                            null);

                    return repository.save(revoked).doOnSuccess(saved -> {
                        logger.info("Revoked control {}", saved.controlId());
                        kafkaTemplate.send("control-events", saved.entityId(), saved);
                    });
                });
    }

    private Mono<AdaptiveControl> createControl(String entityId, ControlType type, String decisionId, String policyId,
            String policyVersion, String policyHash, String reason) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(1, ChronoUnit.HOURS); // Default duration, should be policy driven

        AdaptiveControl control = new AdaptiveControl(
                UUID.randomUUID().toString(),
                entityId,
                type,
                decisionId,
                policyId,
                policyVersion,
                policyHash,
                ControlStatus.ACTIVE,
                expiresAt,
                now,
                reason,
                null,
                null,
                null);
        logger.info("Applying control {} to entity {} due to {}", type, entityId, reason);
        return repository.save(control).doOnSuccess(saved -> {
            kafkaTemplate.send("control-events", saved.entityId(), saved);
        });
    }
}
