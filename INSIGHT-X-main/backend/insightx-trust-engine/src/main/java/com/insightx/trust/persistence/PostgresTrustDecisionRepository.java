package com.insightx.trust.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.trust.domain.TrustDecision;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;

import java.util.List;

/**
 * PostgreSQL (R2DBC) append-only repository for trust decisions.
 */
@Repository
public class PostgresTrustDecisionRepository implements TrustDecisionRepository {

    private final DatabaseClient db;
    private final ObjectMapper objectMapper;

    public PostgresTrustDecisionRepository(DatabaseClient db, ObjectMapper objectMapper) {
        this.db = db;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> append(TrustDecision decision) {
        String appliedPoliciesJson = writeJson(decision.getAppliedPolicies());
        String reasonsJson = writeJson(decision.getReasons());

        return db.sql("""
                INSERT INTO trust_decision(
                    decision_id,
                    entity_id,
                    trust_score,
                    confidence,
                    risk_level,
                    human_in_loop_required,
                    applied_policies_json,
                    reasons_json
                )
                VALUES (
                    :decisionId,
                    :entityId,
                    :trustScore,
                    :confidence,
                    :riskLevel,
                    :humanInLoop,
                    CAST(:appliedPolicies AS jsonb),
                    CAST(:reasons AS jsonb)
                )
                """)
                .bind("decisionId", decision.getDecisionId())
                .bind("entityId", decision.getEntityId())
                .bind("trustScore", decision.getFinalTrustScore().getValue())
                .bind("confidence", decision.getFinalTrustScore().getConfidence())
                .bind("riskLevel", decision.getRiskLevel().name())
                .bind("humanInLoop", decision.isHumanInLoopRequired())
                .bind("appliedPolicies", appliedPoliciesJson)
                .bind("reasons", reasonsJson)
                .fetch()
                .rowsUpdated()
                .then();
    }

    @Override
    public reactor.core.publisher.Flux<TrustDecision> findByEntityIdOrderByTimestampDesc(String entityId) {
        return db.sql("""
                SELECT
                    decision_id,
                    entity_id,
                    trust_score,
                    confidence,
                    risk_level,
                    human_in_loop_required,
                    created_at,
                    applied_policies_json,
                    reasons_json
                FROM trust_decision
                WHERE entity_id = :entityId
                ORDER BY created_at DESC
                """)
                .bind("entityId", entityId)
                .map((row, metadata) -> {
                    try {
                        return mapRowToDecision(row);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to map trust decision row", e);
                    }
                })
                .all();
    }

    private TrustDecision mapRowToDecision(io.r2dbc.spi.Row row) throws JsonProcessingException {
        String decisionId = row.get("decision_id", String.class);
        String entityId = row.get("entity_id", String.class);
        Double trustScore = row.get("trust_score", Double.class);
        Double confidence = row.get("confidence", Double.class);
        String riskLevel = row.get("risk_level", String.class);
        java.time.Instant timestamp = row.get("created_at", java.time.Instant.class);

        String appliedPoliciesJson = row.get("applied_policies_json", String.class);
        String reasonsJson = row.get("reasons_json", String.class);

        @SuppressWarnings("unchecked")
        List<String> appliedPolicies = objectMapper.readValue(appliedPoliciesJson, List.class);
        @SuppressWarnings("unchecked")
        List<String> reasons = objectMapper.readValue(reasonsJson, List.class);

        // Build TrustDeltas from reasons using factory method
        // TrustDelta.of(trustDelta, confidenceDelta, reason, TrustSource, appliedAt)
        List<com.insightx.trust.domain.TrustDelta> deltas = reasons.stream()
                .map(reason -> com.insightx.trust.domain.TrustDelta.of(
                        0.0, // trustDelta
                        0.0, // confidenceDelta
                        reason,
                        com.insightx.trust.domain.TrustSource.SIGNAL,
                        timestamp))
                .toList();

        // Build TrustState using correct constructor: (entityId, TrustScore, Instant,
        // RollingHistorySummary)
        com.insightx.trust.domain.TrustState resultingState = new com.insightx.trust.domain.TrustState(
                entityId,
                new com.insightx.trust.domain.TrustScore(trustScore, confidence),
                timestamp,
                com.insightx.trust.domain.RollingHistorySummary.empty(timestamp));

        // TrustDecision record constructor: (decisionId, entityId, finalScore,
        // riskLevel, policyFlags, orderedDeltas, decidedAt, resultingState)
        return new TrustDecision(
                decisionId,
                entityId,
                new com.insightx.trust.domain.TrustScore(trustScore, confidence),
                com.insightx.trust.domain.RiskLevel.valueOf(riskLevel),
                appliedPolicies,
                deltas,
                timestamp,
                resultingState);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize JSON value for persistence", e);
        }
    }
}
