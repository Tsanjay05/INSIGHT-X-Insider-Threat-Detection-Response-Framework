package com.insightx.trust.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.trust.api.EvaluateTrustRequest;
import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.RiskIndicator;
import com.insightx.trust.service.TrustEvaluationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Listens to normalized-signals from Kafka and triggers trust evaluations.
 * Bridges the domain model of the ingestion service with the trust-engine.
 */
@Service
public class SignalListener {

    private static final Logger logger = LoggerFactory.getLogger(SignalListener.class);

    private final TrustEvaluationService trustEvaluationService;
    private final ObjectMapper objectMapper;

    public SignalListener(TrustEvaluationService trustEvaluationService, ObjectMapper objectMapper) {
        this.trustEvaluationService = trustEvaluationService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "normalized-signals", groupId = "insightx-trust-engine-group")
    public void onNormalizedSignal(String message) {
        try {
            logger.debug("Received normalized signal: {}", message);
            JsonNode node = objectMapper.readTree(message);

            String signalId = node.path("signalId").asText();
            String entityId = node.path("principalId").asText();
            String activityType = node.path("activityType").asText();

            // Handle various Instant serialization formats
            Instant timestamp;
            JsonNode tsNode = node.path("timestamp");
            if (tsNode.isNumber()) {
                timestamp = Instant.ofEpochSecond(tsNode.asLong());
            } else {
                timestamp = Instant.parse(tsNode.asText());
            }

            NormalizedSignal internalSignal = mapToInternal(signalId, activityType, timestamp);

            EvaluateTrustRequest request = new EvaluateTrustRequest(
                    entityId,
                    List.of(internalSignal),
                    timestamp);

            trustEvaluationService.evaluate(request)
                    .subscribe(
                            decision -> logger.info(
                                    "Automated evaluation successful for user {}: decisionId={}, risk={}",
                                    entityId, decision.getDecisionId(), decision.getRiskLevel()),
                            error -> logger.error("Automated evaluation failed for user {}: {}", entityId,
                                    error.getMessage()));

        } catch (Exception e) {
            logger.error("Failed to process normalized signal from Kafka: {}", e.getMessage(), e);
        }
    }

    private NormalizedSignal mapToInternal(String id, String activityType, Instant timestamp) {
        RiskIndicator.Type type = RiskIndicator.Type.OTHER;
        double severity = 0.5;
        double contribution = -5.0;
        String description = "Automated signal for " + activityType;

        if ("LOGIN_ATTEMPT".equals(activityType)) {
            type = RiskIndicator.Type.BEHAVIORAL;
            severity = 0.1;
            contribution = 0.0; // Baseline login
        } else if ("SENSITIVE_ACCESS".equals(activityType) || activityType.contains("ACCESS")) {
            type = RiskIndicator.Type.DATA_ACCESS;
            severity = 0.7;
            contribution = -15.0;
        } else if (activityType.contains("MALICIOUS") || activityType.contains("ATTACK")) {
            type = RiskIndicator.Type.DATA_EXFILTRATION;
            severity = 0.9;
            contribution = -40.0;
        }

        return new NormalizedSignal(id, type, severity, contribution, description, "ingestion-pipeline", timestamp);
    }
}
