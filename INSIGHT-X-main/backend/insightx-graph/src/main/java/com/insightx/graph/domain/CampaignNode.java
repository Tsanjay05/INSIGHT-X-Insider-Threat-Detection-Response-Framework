package com.insightx.graph.domain;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Node("Campaign")
public class CampaignNode {
    @Id
    private String campaignId;

    private String name;
    private Instant startedAt;
    private Instant lastActivityAt;

    @Relationship(type = "INCLUDES", direction = Relationship.Direction.OUTGOING)
    private Set<InteractionEdge> interactions = new HashSet<>();

    @Relationship(type = "ESCALATED_TO", direction = Relationship.Direction.OUTGOING)
    private Set<KillChainStageNode> stages = new HashSet<>();

    // No-args constructor required by Spring Data Neo4j
    public CampaignNode() {
    }

    public CampaignNode(String campaignId, String name, Instant startedAt) {
        this.campaignId = campaignId;
        this.name = name;
        this.startedAt = startedAt;
        this.lastActivityAt = startedAt;
    }

    public void addInteraction(InteractionEdge interaction) {
        this.interactions.add(interaction);
        if (interaction.getTimestamp().isAfter(lastActivityAt)) {
            this.lastActivityAt = interaction.getTimestamp();
        }
    }

    public void addStage(KillChainStageNode stage) {
        this.stages.add(stage);
    }

    public String getCampaignId() {
        return campaignId;
    }

    public String getName() {
        return name;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getLastActivityAt() {
        return lastActivityAt;
    }
}
