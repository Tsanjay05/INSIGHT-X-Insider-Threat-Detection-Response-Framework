package com.insightx.trust.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

/**
 * Represents a normalized event within the Trust Engine.
 * 
 * <p>
 * This is the canonical format for all events after ingestion and
 * normalization.
 */
public record TrustEvent(
        UUID eventId,
        String userId,
        String eventType,
        Instant timestamp,
        String sourceSystem,
        Map<String, Object> details,
        Map<String, String> metadata) {
    public TrustEvent {
        if (eventId == null)
            eventId = UUID.randomUUID();
        if (details == null)
            details = Collections.emptyMap();
        if (metadata == null)
            metadata = Collections.emptyMap();
    }
}
