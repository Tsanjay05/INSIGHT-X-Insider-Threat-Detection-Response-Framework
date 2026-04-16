package com.insightx.intent.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceCreator;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.r2dbc.postgresql.codec.Json;

@Table("intent_hypotheses")
public class IntentHypothesis {

    @Id
    private final UUID hypothesisId;
    private final String entityId;
    private final HypothesisType type;
    private final Double confidenceScore;
    private final Json evidenceRefs; // Store as JSONB
    private final Json decayMetadata; // Store as JSONB
    private final Instant createdAt;
    private final Instant updatedAt;

    // Helper for JSON conversion (typically handled by converters but explicit here
    // for clarity/control if needed)
    // In a real app, R2DBC converters would handle List<String> <-> Json

    @PersistenceCreator
    public IntentHypothesis(UUID hypothesisId, String entityId, HypothesisType type, Double confidenceScore,
            Json evidenceRefs, Json decayMetadata, Instant createdAt, Instant updatedAt) {
        this.hypothesisId = hypothesisId;
        this.entityId = entityId;
        this.type = type;
        this.confidenceScore = confidenceScore;
        this.evidenceRefs = evidenceRefs;
        this.decayMetadata = decayMetadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Factory for new hypothesis
    public static IntentHypothesis create(String entityId, HypothesisType type, Double confidence,
            List<String> evidence, ObjectMapper mapper) {
        try {
            return new IntentHypothesis(
                    UUID.randomUUID(),
                    entityId,
                    type,
                    confidence,
                    Json.of(mapper.writeValueAsString(evidence)),
                    Json.of("{}"),
                    Instant.now(),
                    Instant.now());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize evidence", e);
        }
    }

    public enum HypothesisType {
        BENIGN_ROLE_EXPANSION,
        NEGLIGENT_MISUSE,
        CREDENTIAL_COMPROMISE,
        MALICIOUS_INSIDER,
        EXFILTRATION_ATTEMPT
    }

    // Getters
    public UUID getHypothesisId() {
        return hypothesisId;
    }

    public String getEntityId() {
        return entityId;
    }

    public HypothesisType getType() {
        return type;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public Json getEvidenceRefs() {
        return evidenceRefs;
    }

    public Json getDecayMetadata() {
        return decayMetadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
