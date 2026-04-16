-- Adaptive Controls Table
CREATE TABLE adaptive_controls (
    control_id VARCHAR(255) PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    control_type VARCHAR(50) NOT NULL,
    trigger_decision_id VARCHAR(255) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    policy_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- ACTIVE, REVOKED, EXPIRED
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    trigger_reason TEXT,
    revoked_at TIMESTAMP,
    revoked_reason TEXT,
    superseded_by_control_id VARCHAR(255)
);

CREATE INDEX idx_controls_entity_id ON adaptive_controls(entity_id);
CREATE INDEX idx_controls_status ON adaptive_controls(status);
CREATE INDEX idx_controls_decision ON adaptive_controls(trigger_decision_id);

-- Approval Requests Table (Human-in-the-Loop)
CREATE TABLE approval_requests (
    approval_id VARCHAR(255) PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    requested_action VARCHAR(100) NOT NULL, -- e.g. BLOCK_USER, REVOKE_ADMIN
    reason TEXT NOT NULL,
    policy_reference JSONB NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, DENIED, EXPIRED
    requested_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolver_user_id VARCHAR(255),
    approval_role VARCHAR(50) NOT NULL, -- SECURITY, HR, COMPLIANCE
    decision_outcome VARCHAR(50), -- APPROVED, DENIED
    expires_at TIMESTAMP
);

CREATE INDEX idx_approvals_entity_id ON approval_requests(entity_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);

-- Simulation Results Table
CREATE TABLE simulation_results (
    simulation_id VARCHAR(255) PRIMARY KEY,
    decision_id VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    simulated_outcome JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL
);
