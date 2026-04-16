package com.insightx.ingestion.service;

import com.insightx.ingestion.domain.NormalizedSignal;
import com.insightx.ingestion.domain.RawEvent;
import com.insightx.ingestion.repository.ProcessedEvent;
import com.insightx.ingestion.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class IngestionOrchestrator {

    private static final Logger logger = LoggerFactory.getLogger(IngestionOrchestrator.class);

    private final NormalizationService normalizationService;
    private final EnrichmentService enrichmentService;
    private final KafkaTemplate<String, NormalizedSignal> kafkaTemplate;
    private final ProcessedEventRepository processedEventRepository;
    private final TransactionalOperator rxtx;

    public IngestionOrchestrator(NormalizationService normalizationService,
            EnrichmentService enrichmentService,
            KafkaTemplate<String, NormalizedSignal> kafkaTemplate,
            ProcessedEventRepository processedEventRepository,
            TransactionalOperator rxtx) {
        this.normalizationService = normalizationService;
        this.enrichmentService = enrichmentService;
        this.kafkaTemplate = kafkaTemplate;
        this.processedEventRepository = processedEventRepository;
        this.rxtx = rxtx;
    }

    @KafkaListener(topics = "raw-events", groupId = "insightx-ingestion-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(RawEvent rawEvent) {
        logger.debug("Received raw event: {}", rawEvent.id());

        processedEventRepository.existsById(rawEvent.id())
                .filter(exists -> !exists)
                .flatMap(notExists -> {
                    NormalizedSignal normalized = normalizationService.normalize(rawEvent);
                    return enrichmentService.enrich(normalized)
                            .flatMap(enriched -> Mono
                                    .fromFuture(
                                            kafkaTemplate.send("normalized-signals", enriched.principalId(), enriched)
                                                    .toCompletableFuture())
                                    .then(processedEventRepository
                                            .save(new ProcessedEvent(rawEvent.id(), Instant.now()))));
                })
                .as(rxtx::transactional)
                .subscribe(
                        result -> logger.info("Processed event: {}", rawEvent.id()),
                        error -> logger.error("Error processing event {}: {}", rawEvent.id(), error.getMessage()),
                        () -> logger.debug("Event {} already processed or skipped", rawEvent.id()));
    }
}
