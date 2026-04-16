package com.insightx.graph.controller;

import com.insightx.graph.domain.CampaignNode;
import com.insightx.graph.service.CampaignService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final CampaignService campaignService;

    public GraphController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping("/campaigns/user/{userId}")
    public List<CampaignNode> getUserCampaigns(@PathVariable String userId) {
        return campaignService.getActiveCampaigns(userId);
    }

    @GetMapping("/campaigns/{campaignId}")
    public CampaignNode getCampaign(@PathVariable String campaignId) {
        return campaignService.getCampaignDetails(campaignId).orElse(null);
    }
}
