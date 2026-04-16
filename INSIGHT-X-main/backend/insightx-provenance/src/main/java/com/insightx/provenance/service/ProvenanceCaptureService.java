package com.insightx.provenance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.provenance.repository.ProvenanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ProvenanceCaptureService {

    private static final Logger logger = LoggerFactory.getLogger(ProvenanceCaptureService.class);
    private final ProvenanceRepository repository;
    private final ObjectMapper objectMapper;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    public ProvenanceCaptureService(ProvenanceRepository repository, ObjectMapper objectMapper,
            org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "trust-decisions", groupId = "insightx-provenance-group")
    @Transactional
    public void captureDecision(String decisionJson) {
        try {
            JsonNode root = objectMapper.readTree(decisionJson);

            // Extract core fields
            String decisionId = root.path("decisionId").asText();
            String entityId = root.path("entityId").asText();
            double score = root.path("trustScore").asDouble();
            double confidence = root.path("confidence").asDouble();
            String risk = root.path("riskLevel").asText();

            // Policy Reference (Assume these exist in payload from Phase 3/4 updates)
            String policyId = root.path("policyRef").path("policyId").asText("unknown");
            String policyVer = root.path("policyRef").path("version").asText("unknown");
            String policyHash = root.path("policyRef").path("hash").asText("unknown");
            boolean fallback = root.path("policyFlags").path("policyFallback").asBoolean(false);
            boolean sim = root.path("isSimulation").asBoolean(false);

            DecisionProvenance provenance = new DecisionProvenance(
                    UUID.randomUUID().toString(),
                    decisionId,
                    entityId,
                    Instant.now(), // Should parse from payload if available
                    score,
                    confidence,
                    risk,
                    policyId,
                    policyVer,
                    policyHash,
                    fallback,
                    sim,
                    Instant.now());

            repository.save(provenance).subscribe(
                    saved -> {
                        logger.info("Captured provenance for decision {}", decisionId);
                        kafkaTemplate.send("decision-provenance-events", saved.decisionId(), saved);

                        // Elasticsearch dual-write for audit trail search
                        indexToElasticsearch(saved, decisionJson);
                    },
                    err -> logger.error("Failed to persist provenance for decision {}", decisionId, err));

            // TODO: Parse and save signals, graph refs, controls in separate tables
            // (Normalization)

        } catch (Exception e) {
            logger.error("Failed to parse decision for provenance", e);
            // Non-blocking for now, but strictly logged. In real system, DLQ.
        }
    }

    /**
     * Index provenance to Elasticsearch for audit trail search.
     * Uses fire-and-forget pattern (non-blocking).
     */
    private void indexToElasticsearch(DecisionProvenance provenance, String decisionJson) {
        try {
            // TODO: Inject ElasticsearchClient and use real indexing
            // Format: decision-provenance-{yyyy.MM}
            // Pseudo-code:
            // String indexName = "decision-provenance-" +
            // LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy.MM"));
            // esClient.index(IndexRequest.of(i -> i
            // .index(indexName)
            // .id(provenance.provenanceId())
            // .document(Map.of(
            // "decisionId", provenance.decisionId(),
            // "entityId", provenance.entityId(),
            // "trustScore", provenance.trustScore(),
            // "riskLevel", provenance.riskLevel(),
            // "timestamp", provenance.capturedAt().toString(),
            // "policyId", provenance.policyId(),
            // "rawJson", decisionJson
            // ))
            // )).subscribe(
            // response -> logger.debug("Indexed provenance {} to Elasticsearch",
            // provenance.decisionId()),
            // error -> logger.error("Failed to index provenance to Elasticsearch: {}",
            // error.getMessage())
            // );

            // For now, just log (Elasticsearch client configuration needed)
            logger.debug("TODO: Index provenance {} to Elasticsearch", provenance.decisionId());

        } catch (Exception e) {
            // Non-critical failure, log and continue
            logger.warn("Elasticsearch indexing failed for provenance {}: {}",
                    provenance.decisionId(), e.getMessage());
        }
    }
}
