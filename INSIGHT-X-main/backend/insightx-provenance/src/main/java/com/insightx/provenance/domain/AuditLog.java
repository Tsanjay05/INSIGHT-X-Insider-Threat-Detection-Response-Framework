package com.insightx.provenance.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;
import java.time.Instant;

@Table("audit_logs")
public record AuditLog(
        @Id Long id,
        Instant timestamp,
        String actor,
        String action,
        String resource,
        String resourceId,
        String details,
        String status,
        String ipAddress,
        @Column("metadata_json") String metadataJson // Store map as JSON string for simplicity in SQL
) {
    public AuditLog {
        if (timestamp == null)
            timestamp = Instant.now();
    }
}
