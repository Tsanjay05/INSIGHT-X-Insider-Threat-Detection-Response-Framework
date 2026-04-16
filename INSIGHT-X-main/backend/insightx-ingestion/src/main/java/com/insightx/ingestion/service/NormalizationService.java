package com.insightx.ingestion.service;

import com.insightx.ingestion.domain.NormalizedSignal;
import com.insightx.ingestion.domain.RawEvent;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

/**
 * Normalizes raw events into a canonical format (FR-1.3).
 */
@Service
public class NormalizationService {

    public NormalizedSignal normalize(RawEvent rawEvent) {
        // Map Raw fields to Normalized fields
        String signalId = rawEvent.id() != null ? rawEvent.id() : UUID.randomUUID().toString();
        String principalId = rawEvent.actorId(); // Assumed mapped from source
        String activityType = rawEvent.eventType(); // Should map to canonical types

        // Logic to standardize activity types could go here

        return new NormalizedSignal(
                signalId,
                principalId,
                activityType,
                rawEvent.timestamp(),
                rawEvent.payload() != null ? rawEvent.payload() : Collections.emptyMap(),
                Collections.singletonMap("source_system", rawEvent.source()));
    }
}
