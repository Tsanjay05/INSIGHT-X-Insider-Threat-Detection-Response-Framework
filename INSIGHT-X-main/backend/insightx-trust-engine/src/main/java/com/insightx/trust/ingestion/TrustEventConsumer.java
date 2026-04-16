package com.insightx.trust.ingestion;

import com.insightx.trust.domain.RawEvent;
import reactor.core.publisher.Flux;

/**
 * Interface for consuming raw events from an underlying transport (e.g.,
 * Kafka).
 * 
 * <p>
 * Corresponds to FR-1.1 (High-volume ingestion).
 */
public interface TrustEventConsumer {

    /**
     * Returns a reactive stream of raw events.
     * 
     * @return Flux of RawEvents.
     */
    Flux<RawEvent> consume();
}
