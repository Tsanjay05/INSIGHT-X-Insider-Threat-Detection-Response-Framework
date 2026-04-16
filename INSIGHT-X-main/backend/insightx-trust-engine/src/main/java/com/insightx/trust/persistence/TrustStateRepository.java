package com.insightx.trust.persistence;

import com.insightx.trust.domain.TrustState;

import reactor.core.publisher.Mono;

/**
 * Repository for the mutable current trust state for an entity.
 *
 * <p>
 * TrustState is the longitudinal "current state" and is updated over time.
 */
public interface TrustStateRepository {

    Mono<TrustState> findByEntityId(String entityId);

    /**
     * Insert-or-update the current trust state deterministically.
     */
    Mono<TrustState> upsert(TrustState state);
}

