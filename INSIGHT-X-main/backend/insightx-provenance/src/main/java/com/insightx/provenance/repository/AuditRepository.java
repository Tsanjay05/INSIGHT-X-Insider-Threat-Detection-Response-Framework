package com.insightx.provenance.repository;

import com.insightx.provenance.domain.AuditLog;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.Instant;

@Repository
public interface AuditRepository extends R2dbcRepository<AuditLog, Long> {
    Flux<AuditLog> findByActor(String actor);

    Flux<AuditLog> findByResource(String resource);

    Flux<AuditLog> findByTimestampBetween(Instant start, Instant end);
}
