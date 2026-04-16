-- Trust State Table
CREATE TABLE trust_state (
    entity_id VARCHAR(255) PRIMARY KEY,
    trust_score DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    history_summary_json TEXT
);

CREATE INDEX idx_trust_state_score ON trust_state(trust_score);
CREATE INDEX idx_trust_state_updated ON trust_state(last_updated);

-- Trust Provenance Table
CREATE TABLE trust_provenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(255) NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    signal_weight DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata_json TEXT,
    FOREIGN KEY (entity_id) REFERENCES trust_state(entity_id)
);

CREATE INDEX idx_trust_provenance_entity ON trust_provenance(entity_id);
CREATE INDEX idx_trust_provenance_timestamp ON trust_provenance(timestamp);

-- Trust Decision Table
CREATE TABLE trust_decision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    trust_score DOUBLE PRECISION NOT NULL,
    rationale TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (entity_id) REFERENCES trust_state(entity_id)
);

CREATE INDEX idx_trust_decision_entity ON trust_decision(entity_id);
CREATE INDEX idx_trust_decision_timestamp ON trust_decision(timestamp);