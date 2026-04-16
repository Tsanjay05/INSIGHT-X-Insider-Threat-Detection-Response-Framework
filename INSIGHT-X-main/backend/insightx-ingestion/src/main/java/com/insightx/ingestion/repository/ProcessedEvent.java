package com.insightx.ingestion.repository;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.domain.Persistable;
import java.time.Instant;

@Table("processed_events")
public record ProcessedEvent(
        @Id String processedEventId,
        Instant processedAt) implements Persistable<String> {

    @Override
    public String getId() {
        return processedEventId;
    }

    @Override
    @Transient
    public boolean isNew() {
        return true;
    }
}
