package com.insightx.ingestion.controller;

import com.insightx.ingestion.domain.RawEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.UUID;
import java.time.Instant;

@RestController
@RequestMapping("/api/ingestion")
public class IngestionController {

    private static final Logger logger = LoggerFactory.getLogger(IngestionController.class);
    private final KafkaTemplate<String, RawEvent> kafkaTemplate;

    public IngestionController(KafkaTemplate<String, RawEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping("/event")
    public Mono<String> ingestEvent(@RequestBody RawEvent event) {
        return Mono.fromCallable(() -> {
            String eventId = event.id() != null ? event.id() : UUID.randomUUID().toString();
            Instant timestamp = event.timestamp() != null ? event.timestamp() : Instant.now();

            // Create a complete event if fields are missing (for easier manual testing)
            RawEvent completeEvent = new RawEvent(
                    eventId,
                    event.source(),
                    event.eventType(),
                    event.actorId(),
                    timestamp,
                    event.payload());

            logger.info("Manually ingesting event: {}", completeEvent.id());
            kafkaTemplate.send("raw-events", completeEvent.id(), completeEvent);
            return "Event ingested: " + completeEvent.id();
        });
    }
}
