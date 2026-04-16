package com.insightx.provenance.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.provenance.domain.AuditLog;
import com.insightx.provenance.repository.AuditRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@Service
public class AuditService {

    private final AuditRepository repository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Mono<AuditLog> logAction(String actor, String action, String resource, String resourceId, String details,
            String status, String ipAddress, Map<String, Object> metadata) {
        String metadataJson = null;
        if (metadata != null) {
            try {
                metadataJson = objectMapper.writeValueAsString(metadata);
            } catch (JsonProcessingException e) {
                // Log error but proceed
                metadataJson = "{}";
            }
        }

        AuditLog log = new AuditLog(null, Instant.now(), actor, action, resource, resourceId, details, status,
                ipAddress, metadataJson);
        return repository.save(log);
    }

    public Flux<AuditLog> getAuditLogs(String actor, String resource, Instant start, Instant end) {
        if (actor != null) {
            return repository.findByActor(actor);
        } else if (resource != null) {
            return repository.findByResource(resource);
        } else if (start != null && end != null) {
            return repository.findByTimestampBetween(start, end);
        } else {
            return repository.findAll(); // Caution: Limit this in production!
        }
    }
}
