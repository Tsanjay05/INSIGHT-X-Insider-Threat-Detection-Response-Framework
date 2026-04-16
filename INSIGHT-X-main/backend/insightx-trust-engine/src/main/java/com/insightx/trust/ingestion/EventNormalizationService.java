package com.insightx.trust.ingestion;

import com.insightx.trust.domain.RawEvent;
import com.insightx.trust.domain.TrustEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service responsible for normalizing raw events into a trusted format.
 * 
 * <p>
 * Corresponds to FR-1.2 and FR-1.3 (Normalization).
 */
@Service
public class EventNormalizationService {

    private static final Logger logger = LoggerFactory.getLogger(EventNormalizationService.class);

    /**
     * Normalizes a raw event.
     * 
     * @param rawEvent The raw event to normalize.
     * @return An Optional containing the normalized TrustEvent (if successful), or
     *         empty.
     */
    public Optional<TrustEvent> normalize(RawEvent rawEvent) {
        logger.debug("Normalizing event: {}", rawEvent.eventId());

        if (rawEvent.userId() == null || rawEvent.userId().isBlank()) {
            logger.warn("Event {} missing userId, skipping.", rawEvent.eventId());
            return Optional.empty();
        }

        TrustEvent trustEvent = new TrustEvent(
                rawEvent.eventId() != null ? rawEvent.eventId() : java.util.UUID.randomUUID(),
                rawEvent.userId(),
                rawEvent.eventType(),
                rawEvent.timestamp(),
                rawEvent.sourceSystem(),
                rawEvent.details(),
                rawEvent.metadata());

        return Optional.of(trustEvent);
    }
}
