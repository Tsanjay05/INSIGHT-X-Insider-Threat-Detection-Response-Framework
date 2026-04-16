package com.insightx.graph.domain;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("KillChainStage")
public class KillChainStageNode {
    @Id
    private String stageName; // RECONNAISSANCE, PRIVILEGE_PROBING, etc.

    // No-args constructor required by Spring Data Neo4j
    public KillChainStageNode() {
    }

    public KillChainStageNode(String stageName) {
        this.stageName = stageName;
    }

    public String getStageName() {
        return stageName;
    }

    public enum Stage {
        RECONNAISSANCE,
        PRIVILEGE_PROBING,
        DATA_STAGING,
        EXFILTRATION,
        IMPACT
    }
}
