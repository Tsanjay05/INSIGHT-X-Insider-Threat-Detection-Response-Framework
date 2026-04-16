package com.insightx.ingestion.connector.dlp;

import java.time.Instant;
import java.util.Map;

public record DlpAlert(
        String alertId,
        String userId,
        String severity,
        String policyName,
        Instant timestamp,
        String sourceSystem,
        Map<String, Object> artifacts) {
}
