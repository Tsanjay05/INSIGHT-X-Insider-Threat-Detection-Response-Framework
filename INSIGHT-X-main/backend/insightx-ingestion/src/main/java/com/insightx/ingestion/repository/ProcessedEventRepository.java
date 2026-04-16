package com.insightx.ingestion.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface ProcessedEventRepository extends ReactiveCrudRepository<ProcessedEvent, String> {
}
