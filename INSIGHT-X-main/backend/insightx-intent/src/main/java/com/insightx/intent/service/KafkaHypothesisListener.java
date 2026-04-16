package com.insightx.intent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.intent.domain.IntentHypothesis.HypothesisType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

/**
 * Kafka consumer that listens to trust-decisions and updates intent hypotheses
 * based on risk patterns and behavioral signals.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaHypothesisListener {

    private final HypothesisService hypothesisService;
    private final ObjectMapper objectMapper;

    /**
     * Listens to trust-decisions topic and updates hypotheses based on risk levels.
     * Mapping:
     * - CRITICAL → MALICIOUS_INSIDER (+0.2 delta)
     * - HIGH + requireSecurityReview → CREDENTIAL_COMPROMISE (+0.15 delta)
     * - HIGH → EXFILTRATION_ATTEMPT (+0.15 delta)
     * - LOW + benign activity → BENIGN_ROLE_EXPANSION (+0.05 delta)
     */
    @KafkaListener(topics = "trust-decisions", groupId = "insightx-intent-group", containerFactory = "kafkaListenerContainerFactory")
    public void onTrustDecision(String decisionJson) {
        try {
            JsonNode decision = objectMapper.readTree(decisionJson);

            String entityId = decision.path("entityId").asText();
            String riskLevel = decision.path("riskLevel").asText("LOW");
            double trustScore = decision.path("trustScore").path("value").asDouble(100.0);
            String decisionId = decision.path("decisionId").asText();

            // Extract policy flags
            JsonNode policyFlags = decision.path("policyFlags");
            boolean requireSecurityReview = policyFlags.path("requireSecurityReview").asBoolean(false);


            // Build evidence reference
            List<String> evidence = new ArrayList<>();
            evidence.add("trust-decision:" + decisionId);
            evidence.add("risk-level:" + riskLevel);
            evidence.add("trust-score:" + trustScore);

            // Map risk patterns to hypothesis updates
            Mono<Void> updateChain = Mono.empty();

            if ("CRITICAL".equals(riskLevel)) {
                // CRITICAL risk suggests potential malicious insider
                updateChain = updateChain.then(
                        hypothesisService.updateHypothesis(
                                entityId,
                                HypothesisType.MALICIOUS_INSIDER,
                                0.20,
                                evidence).then());
                log.info("Updated MALICIOUS_INSIDER hypothesis for entity {} (CRITICAL risk)", entityId);
            }

            if ("HIGH".equals(riskLevel)) {
                if (requireSecurityReview) {
                    // HIGH risk + security review flag suggests credential compromise
                    updateChain = updateChain.then(
                            hypothesisService.updateHypothesis(
                                    entityId,
                                    HypothesisType.CREDENTIAL_COMPROMISE,
                                    0.15,
                                    evidence).then());
                    log.info("Updated CREDENTIAL_COMPROMISE hypothesis for entity {} (HIGH + review)", entityId);
                } else {
                    // HIGH risk without review suggests exfiltration attempt
                    updateChain = updateChain.then(
                            hypothesisService.updateHypothesis(
                                    entityId,
                                    HypothesisType.EXFILTRATION_ATTEMPT,
                                    0.15,
                                    evidence).then());
                    log.info("Updated EXFILTRATION_ATTEMPT hypothesis for entity {} (HIGH risk)", entityId);
                }
            }

            if ("LOW".equals(riskLevel) && trustScore > 70.0) {
                // LOW risk with high trust suggests benign role expansion
                updateChain = updateChain.then(
                        hypothesisService.updateHypothesis(
                                entityId,
                                HypothesisType.BENIGN_ROLE_EXPANSION,
                                0.05,
                                evidence).then());
                log.debug("Updated BENIGN_ROLE_EXPANSION hypothesis for entity {} (LOW risk)", entityId);
            }

            // Execute update chain (non-blocking)
            updateChain.subscribe(
                    null,
                    error -> log.error("Failed to update hypotheses for entity {}: {}", entityId, error.getMessage()));

        } catch (Exception e) {
            log.error("Failed to process trust decision from Kafka: {}", e.getMessage(), e);
        }
    }
}
