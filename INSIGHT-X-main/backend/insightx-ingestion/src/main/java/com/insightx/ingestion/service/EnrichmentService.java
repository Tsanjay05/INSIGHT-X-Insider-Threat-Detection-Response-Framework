package com.insightx.ingestion.service;

import com.insightx.ingestion.domain.NormalizedSignal;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Enriches signals with organizational context (FR-1.2).
 */
@Service
public class EnrichmentService {

    /**
     * Enriches a normalized signal with additional context.
     * 
     * @param signal The signal to enrich.
     * @return Mono of the enriched signal.
     */
    public Mono<NormalizedSignal> enrich(NormalizedSignal signal) {
        // Validation: Ensure context is not null
        Map<String, Object> enrichedContext = new HashMap<>();
        if (signal.context() != null) {
            enrichedContext.putAll(signal.context());
        }

        // Mock Enrichment: Add Role and Entitlements
        // In reality, this would query IAM or a cache
        enrichedContext.put("enriched_role", "ANALYSIS_PENDING");
        enrichedContext.put("sensitivity_level", "UNKNOWN");

        // Example: If accessing sensitive resource, flag it
        if (signal.attributes() != null && signal.attributes().containsKey("resource")) {
            String resource = signal.attributes().get("resource");
            if (resource.contains("confidential")) {
                enrichedContext.put("sensitivity_level", "HIGH");
            }
        }

        return Mono.just(new NormalizedSignal(
                signal.signalId(),
                signal.principalId(),
                signal.activityType(),
                signal.timestamp(),
                enrichedContext, // Updated context
                signal.attributes()));
    }
}
