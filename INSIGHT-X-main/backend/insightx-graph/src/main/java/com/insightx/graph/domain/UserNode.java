package com.insightx.graph.domain;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

@Node("User")
public class UserNode {
    @Id
    private String userId;

    // Relationships
    @Relationship(type = "INTERACTED_WITH", direction = Relationship.Direction.OUTGOING)
    private Set<InteractionEdge> interactions = new HashSet<>();

    // No-args constructor required by Spring Data Neo4j
    public UserNode() {
    }

    public UserNode(String userId) {
        this.userId = userId;
    }

    public void addInteraction(InteractionEdge interaction) {
        this.interactions.add(interaction);
    }

    public String getUserId() {
        return userId;
    }
}
