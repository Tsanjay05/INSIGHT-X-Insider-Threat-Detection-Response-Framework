package com.insightx.provenance.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.Instant;

@Table("decision_provenance")
public record DecisionProvenance(
        @Id String provenanceId,
        String decisionId,
        String entityId,
        Instant decisionTimestamp,
        double trustScore,
        double confidence,
        String riskLevel,
        String policyId,
        String policyVersion,
        String policyHash,
        boolean policyFallback,
        boolean isSimulation,
        Instant createdAt) {
}
