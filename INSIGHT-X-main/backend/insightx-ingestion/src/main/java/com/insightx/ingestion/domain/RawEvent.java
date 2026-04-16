package com.insightx.ingestion.domain;

import java.time.Instant;
import java.util.Map;

public record RawEvent(
        String id,
        String source,
        String eventType,
        String actorId,
        Instant timestamp,
        Map<String, Object> payload) {
}
