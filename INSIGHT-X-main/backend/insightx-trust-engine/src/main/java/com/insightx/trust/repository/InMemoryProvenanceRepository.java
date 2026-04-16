package com.insightx.trust.repository;

import com.insightx.trust.domain.ProvenanceRecord;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory implementation of ProvenanceRepository for Phase 3 verification.
 */
@Repository
public class InMemoryProvenanceRepository implements ProvenanceRepository {

    private final Map<String, ProvenanceRecord> store = new ConcurrentHashMap<>();

    @Override
    public Mono<ProvenanceRecord> append(ProvenanceRecord record) {
        store.put(record.getDecisionId(), record);
        return Mono.just(record);
    }
}
