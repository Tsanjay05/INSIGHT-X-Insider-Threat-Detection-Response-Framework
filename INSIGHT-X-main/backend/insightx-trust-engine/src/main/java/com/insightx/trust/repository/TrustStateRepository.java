package com.insightx.trust.repository;

import com.insightx.trust.domain.TrustState;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface TrustStateRepository extends ReactiveCrudRepository<TrustState, String> {
    // Entity ID is the key
    Mono<TrustState> findByEntityId(String entityId);
}
