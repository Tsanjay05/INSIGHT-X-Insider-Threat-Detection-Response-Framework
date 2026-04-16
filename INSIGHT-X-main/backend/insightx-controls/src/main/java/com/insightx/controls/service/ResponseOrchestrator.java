package com.insightx.controls.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.controls.domain.AdaptiveControl.ControlType;
import com.insightx.controls.domain.ApprovalRequest.ApprovalRole;
import com.insightx.trust.domain.RiskLevel;
import com.insightx.trust.domain.TrustDecision;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class ResponseOrchestrator {

    private static final Logger logger = LoggerFactory.getLogger(ResponseOrchestrator.class);
    private final ControlService controlService;
    private final SimulationService simulationService;
    private final ApprovalService approvalService;
    private final SoarDispatcher soarDispatcher;
    private final ObjectMapper objectMapper;

    public ResponseOrchestrator(ControlService controlService,
            SimulationService simulationService,
            ApprovalService approvalService,
            SoarDispatcher soarDispatcher,
            ObjectMapper objectMapper) {
        this.controlService = controlService;
        this.simulationService = simulationService;
        this.approvalService = approvalService;
        this.soarDispatcher = soarDispatcher;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "trust-decisions", groupId = "insightx-controls-group")
    public void consumeDecision(String decisionJson) {
        try {
            // Use shared domain model for type safety
            TrustDecision decision = objectMapper.readValue(decisionJson, TrustDecision.class);
            
            String entityId = decision.entityId();
            String decisionId = decision.decisionId();
            String policyId = "policy-derived";
            String policyVersion = "v1";
            String policyHash = "hash";

            boolean isSimulation = false; // TODO: Add isSimulation to TrustDecision or wrapper if needed

            // Extract risk level and trust score
            RiskLevel riskLevel = decision.riskLevel();
            double trustScore = decision.finalScore().getValue();

            // CRITICAL: Apply BLOCK_ACCESS for CRITICAL risk or trust score < 20
            if (riskLevel == RiskLevel.CRITICAL || trustScore < 20.0) {
                if (isSimulation) {
                    simulationService.recordSimulation(decisionId, "BLOCK_ACCESS", entityId).subscribe();
                    logger.info("SIMULATION: Would block access for entity {} (riskLevel={}, trustScore={})",
                            entityId, riskLevel, trustScore);
                } else {
                    applyControl(entityId, ControlType.BLOCK_ACCESS, decisionId, policyId, policyVersion,
                            policyHash, "CRITICAL trust score: " + trustScore + ", risk level: " + riskLevel);
                    soarDispatcher.dispatch("BLOCK_USER_ACCESS", entityId, decisionJson).subscribe();
                    logger.warn("BLOCKED ACCESS for entity {} due to CRITICAL risk (score={})", entityId, trustScore);
                }
            }

            if (decision.policyFlags() != null && !decision.policyFlags().isEmpty()) {
                java.util.List<String> flags = decision.policyFlags();

                boolean requireStepUp = flags.contains("requireStepUpAuth");
                boolean requireReview = flags.contains("requireSecurityReview");

                if (requireStepUp) {
                    if (isSimulation) {
                        simulationService.recordSimulation(decisionId, "STEP_UP_AUTH", entityId).subscribe();
                    } else {
                        applyControl(entityId, ControlType.STEP_UP_AUTH, decisionId, policyId, policyVersion,
                                policyHash, "High Risk detected by Policy");
                        soarDispatcher.dispatch("TRIGGER_MFA", entityId, decisionJson).subscribe();
                    }
                }

                if (requireReview) {
                    if (isSimulation) {
                        simulationService.recordSimulation(decisionId, "HUMAN_REVIEW", entityId).subscribe();
                    } else {
                        approvalService.requestApproval(entityId, "SECURITY_REVIEW", "High Risk Activity", decisionId,
                                ApprovalRole.SECURITY).subscribe();
                        logger.info("Human review required for entity {}", entityId);
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to process trust decision", e);
        }
    }

    private void applyControl(String entityId, ControlType type, String decisionId, String pId, String pVer,
            String pHash, String reason) {
        controlService.applyControl(entityId, type, decisionId, pId, pVer, pHash, reason).subscribe();
    }
}
