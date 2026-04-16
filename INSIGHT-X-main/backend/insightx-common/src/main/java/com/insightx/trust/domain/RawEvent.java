package com.insightx.trust.domain;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Represents a raw event ingested from the event stream.
 * 
 * <p>
 * This is the input format before normalization and enrichment.
 * Corresponds to FR-1.1.
 */
public record RawEvent(
        UUID eventId,
        String sourceSystem, // e.g., "IAM", "VPN", "DLP"
        String eventType, // e.g., "LOGIN_ATTEMPT", "FILE_ACCESS"
        String userId, // The raw user identifier from the source
        Instant timestamp,
        Map<String, Object> details,
        Map<String, String> metadata) {
}
