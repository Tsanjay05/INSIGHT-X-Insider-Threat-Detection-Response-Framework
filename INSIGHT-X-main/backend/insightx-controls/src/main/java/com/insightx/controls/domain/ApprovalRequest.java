package com.insightx.controls.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.Instant;

@Table("approval_requests")
public record ApprovalRequest(
        @Id String approvalId,
        String entityId,
        String requestedAction,
        String reason,
        String policyReference, // JSON string
        ApprovalStatus status,
        Instant requestedAt,
        Instant resolvedAt,
        String resolverUserId,
        ApprovalRole approvalRole,
        ApprovalOutcome decisionOutcome,
        Instant expiresAt) {
    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        DENIED,
        EXPIRED
    }

    public enum ApprovalRole {
        SECURITY,
        HR,
        COMPLIANCE
    }

    public enum ApprovalOutcome {
        APPROVED,
        DENIED
    }
}
