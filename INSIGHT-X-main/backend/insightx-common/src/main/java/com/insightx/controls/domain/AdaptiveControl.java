package com.insightx.controls.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.Instant;

@Table("adaptive_controls")
public record AdaptiveControl(
        @Id String controlId,
        String entityId,
        ControlType controlType,
        String triggerDecisionId,
        String policyId,
        String policyVersion,
        String policyHash,
        ControlStatus status,
        Instant expiresAt,
        Instant createdAt,
        String triggerReason,
        Instant revokedAt,
        String revokedReason,
        String supersededByControlId) {
    public enum ControlType {
        MONITOR,
        THROTTLE,
        STEP_UP_AUTH,
        PRIVILEGE_DECAY,
        CANARY_EXPOSURE,
        BLOCK_ACCESS
    }

    public enum ControlStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }
}
