package com.insightx.trust.repository;

import com.insightx.trust.domain.ProvenanceRecord;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Repository for persisting ProvenanceRecords.
 * <p>
 * In a real implementation, this would likely use R2DBC.
 * For Phase 3 implementation scope, we'll implement a simple in-memory or
 * reactive interface.
 * Given "PostgreSQL (append-only decisions & provenance)" exists in
 * constraints,
 * we should define the interface to be compatible with a reactive persist.
 * <p>
 * If actual R2DBC entity mapping for complex records like ProvenanceRecord
 * (with nested records)
 * is too complex for this single-file context without specific schema,
 * we will define it as a Repository interface and mock/stub the implementation
 * for the tests
 * or assume a custom implementation exists.
 * <p>
 * However, since I must "Generate all required classes", I will create the
 * interface.
 * NOTE: ProvenanceRecord is complex (nested records). R2DBC doesn't support
 * nested records out of the box easily without JSON mapping.
 * I will assume we are storing it as a JSON blob or similar in a real DB.
 * For this exercise, I will assume standard ReactiveCrudRepository might not
 * fit perfectly without @Table classes.
 * I will create a custom repository interface with an `append` method as used
 * in TrustEvaluationService.
 */
@Repository
public interface ProvenanceRepository {
    Mono<ProvenanceRecord> append(ProvenanceRecord record);
}
