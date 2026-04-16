package com.insightx.trust.persistence;

import com.insightx.trust.domain.TrustDecision;

import reactor.core.publisher.Mono;

/**
 * Append-only repository for immutable trust decisions.
 */
public interface TrustDecisionRepository {

    Mono<Void> append(TrustDecision decision);

    /**
     * Find trust decisions by entity ID, ordered by timestamp descending (newest
     * first)
     * 
     * @param entityId Entity ID to query
     * @return Flux of trust decisions for the entity
     */
    reactor.core.publisher.Flux<TrustDecision> findByEntityIdOrderByTimestampDesc(String entityId);
}
