package com.insightx.trust.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.trust.domain.ProvenanceRecord;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;

/**
 * PostgreSQL (R2DBC) append-only repository for provenance.
 *
 * <p>
 * Provenance is stored as an immutable JSONB document.
 */
@Repository
public class PostgresProvenanceRepository implements ProvenanceRepository {

    private final DatabaseClient db;
    private final ObjectMapper objectMapper;

    public PostgresProvenanceRepository(DatabaseClient db, ObjectMapper objectMapper) {
        this.db = db;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> append(ProvenanceRecord record) {
        String json = writeJson(record);

        String policyVersion = "1.0.0";
        if (record.getPolicyReferences() != null && !record.getPolicyReferences().isEmpty()) {
            policyVersion = record.getPolicyReferences().get(0).getVersion();
        }

        DatabaseClient.GenericExecuteSpec spec = db.sql("""
                INSERT INTO trust_provenance(
                    decision_id,
                    entity_id,
                    evaluation_started_at,
                    evaluation_completed_at,
                    provenance_json,
                    policy_version
                )
                VALUES (
                    :decisionId,
                    :entityId,
                    :startedAt,
                    :completedAt,
                    CAST(:json AS jsonb),
                    :policyVersion
                )
                """)
                .bind("decisionId", record.getDecisionId())
                .bind("entityId", record.getEntityId())
                .bind("startedAt", record.getTimestamps().evaluationStartedAt())
                .bind("completedAt", record.getTimestamps().evaluationCompletedAt())
                .bind("json", json);

        if (policyVersion != null) {
            spec = spec.bind("policyVersion", policyVersion);
        } else {
            spec = spec.bindNull("policyVersion", String.class);
        }

        return spec.fetch()
                .rowsUpdated()
                .then();
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize provenance JSON", e);
        }
    }
}
