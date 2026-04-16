package com.insightx.intent.repository;

import com.insightx.intent.domain.IntentHypothesis;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IntentHypothesisRepository extends R2dbcRepository<IntentHypothesis, UUID> {

    /**
     * Find all hypotheses for a specific entity.
     * Replaces the anti-pattern: findAll().filter(h ->
     * h.getEntityId().equals(entityId))
     */
    reactor.core.publisher.Flux<IntentHypothesis> findByEntityId(String entityId);
}
