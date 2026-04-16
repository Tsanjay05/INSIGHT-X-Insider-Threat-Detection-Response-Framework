package com.insightx.graph.domain;

import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

@RelationshipProperties
public class InteractionEdge {
    @RelationshipId
    private Long id;

    @TargetNode
    private ResourceNode resource;

    private String activityType;
    private Instant timestamp;

    public InteractionEdge(ResourceNode resource, String activityType, Instant timestamp) {
        this.resource = resource;
        this.activityType = activityType;
        this.timestamp = timestamp;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public ResourceNode getResource() {
        return resource;
    }

    public String getActivityType() {
        return activityType;
    }
}
