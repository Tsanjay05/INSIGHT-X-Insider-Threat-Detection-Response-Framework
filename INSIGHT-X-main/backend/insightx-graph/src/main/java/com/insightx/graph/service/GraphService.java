package com.insightx.graph.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.graph.domain.InteractionEdge;
import com.insightx.graph.domain.ResourceNode;
import com.insightx.graph.domain.UserNode;
import com.insightx.graph.repository.UserNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

interface ResourceRepository extends Neo4jRepository<ResourceNode, String> {
}

/**
 * Service to manage behavioral graph and execute traversals (FR-4.1, FR-4.2).
 * Also handles kill chain progression based on trust decisions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GraphService {

    private final UserNodeRepository userNodeRepository;
    private final ResourceRepository resourceRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void recordInteraction(String userId, String resourceId, String activityType, Instant timestamp) {
        UserNode user = userNodeRepository.findById(userId)
                .orElseGet(() -> userNodeRepository.save(new UserNode(userId)));

        ResourceNode resource = resourceRepository.findById(resourceId)
                .orElseGet(() -> resourceRepository.save(new ResourceNode(resourceId, "UNKNOWN")));

        InteractionEdge edge = new InteractionEdge(resource, activityType, timestamp);
        user.addInteraction(edge);

        userNodeRepository.save(user);
    }

    /**
     * Listens to trust-decisions and updates kill chain progression.
     * Mapping:
     * - LOW → RECONNAISSANCE
     * - MEDIUM → PRIVILEGE_PROBING
     * - HIGH → LATERAL_MOVEMENT
     * - CRITICAL → EXFILTRATION_ATTEMPT
     */
    @KafkaListener(topics = "trust-decisions", groupId = "insightx-graph-group", containerFactory = "kafkaListenerContainerFactory")
    public void onTrustDecision(String decisionJson) {
        try {
            JsonNode decision = objectMapper.readTree(decisionJson);

            String userId = decision.path("entityId").asText();
            String riskLevel = decision.path("riskLevel").asText("LOW");
            double trustScore = decision.path("trustScore").path("value").asDouble(100.0);

            // Map risk level to kill chain stage
            String killChainStage = mapRiskToKillChainStage(riskLevel);

            // Ensure UserNode exists
            Optional<UserNode> userNodeOpt = userNodeRepository.findById(userId);
            UserNode userNode;

            if (userNodeOpt.isEmpty()) {
                // Create new UserNode if it doesn't exist
                userNode = new UserNode(userId);
                userNode = userNodeRepository.save(userNode);
                log.info("Created new UserNode for userId: {}", userId);
            } else {
                userNode = userNodeOpt.get();
            }

            // TODO: Link to CampaignNode and escalate kill chain stage
            // This would involve creating/updating CampaignNode and KillChainStageNode
            // relationships
            // For now, log the progression
            log.info("Kill chain progression for user {}: {} (riskLevel={}, trustScore={})",
                    userId, killChainStage, riskLevel, trustScore);

        } catch (Exception e) {
            log.error("Failed to process trust decision for graph update: {}", e.getMessage(), e);
        }
    }

    /**
     * Map risk level to kill chain stage.
     */
    private String mapRiskToKillChainStage(String riskLevel) {
        return switch (riskLevel) {
            case "LOW" -> "RECONNAISSANCE";
            case "MEDIUM" -> "PRIVILEGE_PROBING";
            case "HIGH" -> "LATERAL_MOVEMENT";
            case "CRITICAL" -> "EXFILTRATION_ATTEMPT";
            default -> "UNKNOWN";
        };
    }

    // Traversal logic for "Kill Chain" analysis would go here directly via Cypher
    // queries
    // E.g. find users who did Recon then Access
}
