package com.insightx.intent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.intent.domain.IntentHypothesis;
import com.insightx.intent.domain.IntentHypothesis.HypothesisType;
import com.insightx.intent.repository.IntentHypothesisRepository;
import io.r2dbc.postgresql.codec.Json;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Service to manage and evolve intent hypotheses (FR-3.1, FR-3.2).
 */
@Service
public class HypothesisService {

    private final IntentHypothesisRepository repository;
    private final ObjectMapper objectMapper;

    public HypothesisService(IntentHypothesisRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Flux<IntentHypothesis> getHypotheses(String entityId) {
        // In a real scenario, we'd add findByEntityId to the repository interface
        // For now, filtering works but is inefficient for large datasets
        return repository.findAll().filter(h -> h.getEntityId().equals(entityId));
    }

    @Transactional
    public Mono<IntentHypothesis> updateHypothesis(String entityId, HypothesisType type, double scoreChange,
            String evidence) {
        return repository.findAll()
                .filter(h -> h.getEntityId().equals(entityId) && h.getType() == type)
                .next()
                .flatMap(existing -> {
                    double newScore = Math.max(0.0, Math.min(1.0, existing.getConfidenceScore() + scoreChange));
                    List<String> evidenceList = parseEvidence(existing.getEvidenceRefs());
                    evidenceList.add(evidence);

                    try {
                        Json newEvidence = Json.of(objectMapper.writeValueAsString(evidenceList));
                        IntentHypothesis updated = new IntentHypothesis(
                                existing.getHypothesisId(),
                                existing.getEntityId(),
                                existing.getType(),
                                newScore,
                                newEvidence,
                                existing.getDecayMetadata(),
                                existing.getCreatedAt(),
                                Instant.now());
                        return repository.save(updated);
                    } catch (JsonProcessingException e) {
                        return Mono.error(e);
                    }
                })
                .switchIfEmpty(createHypothesis(entityId, type, Math.max(0.0, scoreChange), evidence));
    }

    /**
     * Overloaded method accepting List of evidence refs (for Kafka listeners).
     */
    @Transactional
    public Mono<IntentHypothesis> updateHypothesis(String entityId, HypothesisType type, double scoreChange,
            List<String> evidenceRefs) {
        return repository.findAll()
                .filter(h -> h.getEntityId().equals(entityId) && h.getType() == type)
                .next()
                .flatMap(existing -> {
                    double newScore = Math.max(0.0, Math.min(1.0, existing.getConfidenceScore() + scoreChange));
                    List<String> evidenceList = parseEvidence(existing.getEvidenceRefs());
                    evidenceList.addAll(evidenceRefs);

                    try {
                        Json newEvidence = Json.of(objectMapper.writeValueAsString(evidenceList));
                        IntentHypothesis updated = new IntentHypothesis(
                                existing.getHypothesisId(),
                                existing.getEntityId(),
                                existing.getType(),
                                newScore,
                                newEvidence,
                                existing.getDecayMetadata(),
                                existing.getCreatedAt(),
                                Instant.now());
                        return repository.save(updated);
                    } catch (JsonProcessingException e) {
                        return Mono.error(e);
                    }
                })
                .switchIfEmpty(createHypothesis(entityId, type, Math.max(0.0, scoreChange),
                        evidenceRefs.isEmpty() ? "initial" : evidenceRefs.get(0)));
    }

    private Mono<IntentHypothesis> createHypothesis(String entityId, HypothesisType type, double initialScore,
            String evidence) {
        return Mono
                .fromCallable(() -> IntentHypothesis.create(entityId, type, initialScore,
                        Collections.singletonList(evidence), objectMapper))
                .flatMap(repository::save);
    }

    private List<String> parseEvidence(Json json) {
        try {
            return new ArrayList<>(java.util.Arrays.asList(objectMapper.readValue(json.asString(), String[].class)));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
