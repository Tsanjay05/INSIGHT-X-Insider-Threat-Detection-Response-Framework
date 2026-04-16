package com.insightx.graph.service;

import com.insightx.graph.domain.CampaignNode;
import com.insightx.graph.domain.InteractionEdge;
import com.insightx.graph.domain.KillChainStageNode;
import com.insightx.graph.domain.ResourceNode;
import com.insightx.graph.domain.UserNode;
import com.insightx.graph.repository.UserNodeRepository;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

interface CampaignRepository extends Neo4jRepository<CampaignNode, String> {
}

interface KillChainStageRepository extends Neo4jRepository<KillChainStageNode, String> {
}

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final KillChainStageRepository stageRepository;
    private final UserNodeRepository userNodeRepository;
    private final ResourceRepository resourceRepository;

    public CampaignService(CampaignRepository campaignRepository,
            KillChainStageRepository stageRepository,
            UserNodeRepository userNodeRepository,
            ResourceRepository resourceRepository) {
        this.campaignRepository = campaignRepository;
        this.stageRepository = stageRepository;
        this.userNodeRepository = userNodeRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public void processInteraction(String userId, String resourceId, String activityType, Instant timestamp) {
        // 1. Ensure User & Resource
        UserNode user = userNodeRepository.findById(userId)
                .orElseGet(() -> userNodeRepository.save(new UserNode(userId)));
        ResourceNode resource = resourceRepository.findById(resourceId)
                .orElseGet(() -> resourceRepository.save(new ResourceNode(resourceId, "UNKNOWN")));

        // 2. Determine Stage
        KillChainStageNode.Stage stageEnum = mapToStage(activityType);
        KillChainStageNode stageNode = stageRepository.findById(stageEnum.name())
                .orElseGet(() -> stageRepository.save(new KillChainStageNode(stageEnum.name())));

        // 3. Find or Create Campaign (Simplified correlation logic)
        CampaignNode campaign = new CampaignNode(UUID.randomUUID().toString(), "Auto-Campaign-" + userId, timestamp);
        // Link interaction
        InteractionEdge interaction = new InteractionEdge(resource, activityType, timestamp);
        campaign.addInteraction(interaction);
        campaign.addStage(stageNode);

        campaignRepository.save(campaign);
    }

    private KillChainStageNode.Stage mapToStage(String activityType) {
        if (activityType.contains("LOGIN"))
            return KillChainStageNode.Stage.RECONNAISSANCE;
        if (activityType.contains("ACCESS"))
            return KillChainStageNode.Stage.PRIVILEGE_PROBING;
        if (activityType.contains("EXPORT"))
            return KillChainStageNode.Stage.EXFILTRATION;
        return KillChainStageNode.Stage.RECONNAISSANCE; // Default
    }

    // Explainability / API
    public java.util.List<CampaignNode> getActiveCampaigns(String userId) {
        // Mock query - in real world use repository.findActiveByUserId(userId)
        return java.util.Collections.emptyList();
    }

    public Optional<CampaignNode> getCampaignDetails(String campaignId) {
        return campaignRepository.findById(campaignId);
    }
}
