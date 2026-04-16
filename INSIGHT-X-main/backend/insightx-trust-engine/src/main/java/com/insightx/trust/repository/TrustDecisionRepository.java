package com.insightx.trust.repository;

import com.insightx.trust.domain.TrustDecision;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrustDecisionRepository extends ReactiveCrudRepository<TrustDecision, String> {
    // Decision ID is the key
}
