package com.insightx.controls.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.controls.domain.SimulationResult;
import com.insightx.controls.repository.SimulationResultRepository;
import io.r2dbc.postgresql.codec.Json;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class SimulationService {

    private final SimulationResultRepository repository;
    private final ObjectMapper objectMapper;

    public SimulationService(SimulationResultRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Mono<SimulationResult> recordSimulation(String decisionId, String wouldApplyControl, String entityId) {
        try {
            Map<String, String> outcome = Map.of(
                    "control", wouldApplyControl,
                    "mode", "SHADOW");
            Json json = Json.of(objectMapper.writeValueAsString(outcome));

            SimulationResult result = new SimulationResult(
                    UUID.randomUUID().toString(),
                    decisionId,
                    entityId, // Now matches database schema
                    json,
                    Instant.now());
            return repository.save(result);
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }
    }
}
