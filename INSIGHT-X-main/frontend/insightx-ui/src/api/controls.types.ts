// Controls API Types
export interface AdaptiveControl {
    controlId: string;
    entityId: string;
    controlType: 'THROTTLE' | 'STEP_UP_AUTH' | 'PRIVILEGE_DECAY' | 'CANARY_EXPOSURE' | 'BLOCK_ACCESS';
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    decisionId: string;
    policyId: string;
    appliedAt: string;
    expiresAt: string | null;
    revokedAt: string | null;
    revokedReason: string | null;
    reason: string;
}

export interface ApprovalRequest {
    requestId: string;
    entityId: string;
    decisionId: string;
    requestedAt: string;
    status: 'PENDING' | 'APPROVED' | 'DENIED';
    reviewedBy: string | null;
    reviewedAt: string | null;
    notes: string | null;
}

export interface RevokeControlRequest {
    reason: string;
}

export interface ApprovalActionRequest {
    notes?: string;
}
