package com.insightx.graph.domain;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Resource")
public class ResourceNode {
    @Id
    private String resourceId;

    private String sensitivity; // e.g., "HIGH", "CRITICAL"

    // No-args constructor required by Spring Data Neo4j
    public ResourceNode() {
    }

    public ResourceNode(String resourceId, String sensitivity) {
        this.resourceId = resourceId;
        this.sensitivity = sensitivity;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getSensitivity() {
        return sensitivity;
    }
}
