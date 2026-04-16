package com.insightx.provenance.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.provenance.repository.ProvenanceRepository;
import com.insightx.trust.domain.TrustDecision;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class TrustDecisionListener {

    private static final Logger logger = LoggerFactory.getLogger(TrustDecisionListener.class);

    private final ObjectMapper objectMapper;
    private final ProvenanceRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TrustDecisionListener(ObjectMapper objectMapper, ProvenanceRepository repository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.objectMapper = objectMapper;
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "trust-decisions", groupId = "insightx-provenance-consumer")
    public void consume(String message) {
        try {
            TrustDecision decision = objectMapper.readValue(message, TrustDecision.class);

            // Transform to DecisionProvenance
            DecisionProvenance provenance = new DecisionProvenance(
                    java.util.UUID.randomUUID().toString(),
                    decision.decisionId(),
                    decision.entityId(),
                    decision.decidedAt(),
                    decision.finalScore().getValue(),
                    decision.finalScore().getConfidence(),
                    decision.riskLevel().name(),
                    null, // PolicyId not strictly in TrustDecision unless parsed from flags/explanation?
                    null, // PolicyVersion
                    null, // PolicyHash
                    false, // Fallback unknown
                    false, // Simulation unknown
                    Instant.now());

            // Persist (Audit) and then Emit (Stream)
            repository.save(provenance)
                    .doOnSuccess(saved -> kafkaTemplate.send("decision-provenance-events", saved.entityId(), saved))
                    .subscribe();

        } catch (JsonProcessingException e) {
            logger.error("Failed to process trust decision for provenance", e);
        }
    }
}
