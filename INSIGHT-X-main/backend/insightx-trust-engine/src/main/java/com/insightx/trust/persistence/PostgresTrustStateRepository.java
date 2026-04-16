package com.insightx.trust.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.trust.domain.RollingHistorySummary;
import com.insightx.trust.domain.TrustScore;
import com.insightx.trust.domain.TrustState;

import java.time.Instant;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;

/**
 * PostgreSQL (R2DBC) implementation of {@link TrustStateRepository}.
 *
 * <p>
 * Domain types remain persistence-annotation-free; mapping is explicit.
 */
@Repository
public class PostgresTrustStateRepository implements TrustStateRepository {

    private final DatabaseClient db;
    private final ObjectMapper objectMapper;

    public PostgresTrustStateRepository(DatabaseClient db, ObjectMapper objectMapper) {
        this.db = db;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<TrustState> findByEntityId(String entityId) {
        return db.sql("""
                SELECT entity_id, trust_score, confidence, last_updated, history_summary_json
                FROM trust_state
                WHERE entity_id = :entityId
                """)
                .bind("entityId", entityId)
                .map((row, meta) -> {
                    String id = row.get("entity_id", String.class);
                    Double score = row.get("trust_score", Double.class);
                    Double confidence = row.get("confidence", Double.class);
                    Instant lastUpdated = row.get("last_updated", Instant.class);
                    String historyJson = row.get("history_summary_json", String.class);

                    RollingHistorySummary summary = readJson(historyJson, RollingHistorySummary.class);
                    return new TrustState(
                            id,
                            new TrustScore(score == null ? 50.0 : score, confidence == null ? 0.5 : confidence),
                            lastUpdated == null ? Instant.EPOCH : lastUpdated,
                            summary == null ? RollingHistorySummary.empty(Instant.EPOCH) : summary);
                })
                .one();
    }

    @Override
    public Mono<TrustState> upsert(TrustState state) {
        String summaryJson;
        try {
            summaryJson = objectMapper.writeValueAsString(state.getRollingHistorySummary());
        } catch (JsonProcessingException e) {
            return Mono.error(new IllegalStateException("Failed to serialize RollingHistorySummary", e));
        }

        return db.sql("""
                INSERT INTO trust_state(entity_id, trust_score, confidence, last_updated, history_summary_json)
                VALUES (:entityId, :trustScore, :confidence, :lastUpdated, CAST(:historyJson AS jsonb))
                ON CONFLICT (entity_id) DO UPDATE
                SET trust_score = EXCLUDED.trust_score,
                    confidence = EXCLUDED.confidence,
                    last_updated = EXCLUDED.last_updated,
                    history_summary_json = EXCLUDED.history_summary_json
                """)
                .bind("entityId", state.getEntityId())
                .bind("trustScore", state.getCurrentTrustScore().getValue())
                .bind("confidence", state.getCurrentTrustScore().getConfidence())
                .bind("lastUpdated", state.getLastUpdated())
                .bind("historyJson", summaryJson)
                .fetch()
                .rowsUpdated()
                .thenReturn(state);
    }

    private <T> T readJson(String json, Class<T> clazz) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            // Explicit failure is preferable, but for Phase 1 compilation we avoid hard
            // crashes in reads.
            return null;
        }
    }
}
