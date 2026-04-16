package com.insightx.trust.persistence;

import com.insightx.trust.domain.ProvenanceRecord;

import reactor.core.publisher.Mono;

/**
 * Append-only repository for immutable decision provenance.
 *
 * <p>
 * Provenance is stored as JSONB in PostgreSQL.
 */
public interface ProvenanceRepository {

    Mono<Void> append(ProvenanceRecord record);
}

