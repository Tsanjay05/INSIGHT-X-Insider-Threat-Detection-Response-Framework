package com.insightx.ingestion.domain;

import java.time.Instant;
import java.util.Map;

public record NormalizedSignal(
        String signalId,
        String principalId,
        String activityType,
        Instant timestamp,
        Map<String, Object> context,
        Map<String, String> attributes) {
}
