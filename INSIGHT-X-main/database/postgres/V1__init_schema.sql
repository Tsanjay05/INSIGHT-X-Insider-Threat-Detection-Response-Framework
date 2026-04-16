-- INSIGHT-X PostgreSQL Schema
-- User trust state, risk indicators, policy decisions, human approvals

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User trust state (FR-2.1)
CREATE TABLE user_trust_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    trust_score DECIMAL(5,4) NOT NULL CHECK (trust_score >= 0 AND trust_score <= 1),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB,
    UNIQUE(user_id, computed_at)
);

CREATE INDEX idx_user_trust_user_id ON user_trust_state(user_id);
CREATE INDEX idx_user_trust_computed_at ON user_trust_state(computed_at);

-- Risk indicators
CREATE TABLE risk_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    indicator_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB
);

CREATE INDEX idx_risk_user_id ON risk_indicators(user_id);
CREATE INDEX idx_risk_created_at ON risk_indicators(created_at);

-- Policy decisions
CREATE TABLE policy_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    input JSONB,
    output JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB
);

CREATE INDEX idx_policy_decision_user_id ON policy_decisions(user_id);
CREATE INDEX idx_policy_decision_created_at ON policy_decisions(created_at);

-- Human approvals (FR-6.4)
CREATE TABLE human_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    decided_by VARCHAR(255),
    provenance JSONB
);

CREATE INDEX idx_approval_user_id ON human_approvals(user_id);
CREATE INDEX idx_approval_status ON human_approvals(status);
