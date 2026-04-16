package com.insightx.ingestion.connector.iam;

import java.time.Instant;
import java.util.Map;

public record IamEvent(
        String eventId,
        String userId,
        String eventType,
        Instant timestamp,
        String sourceSystem,
        Map<String, Object> details) {
}
