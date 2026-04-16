package com.insightx.provenance.repository;

import com.insightx.provenance.domain.DecisionProvenance;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProvenanceRepository extends R2dbcRepository<DecisionProvenance, String> {
    reactor.core.publisher.Mono<DecisionProvenance> findByDecisionId(String decisionId);

    reactor.core.publisher.Flux<DecisionProvenance> findByEntityId(String entityId);
}
