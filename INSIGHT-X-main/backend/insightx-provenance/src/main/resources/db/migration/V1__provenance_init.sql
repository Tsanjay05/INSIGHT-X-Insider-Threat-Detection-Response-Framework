-- Decision Provenance (Core immutable record)
CREATE TABLE decision_provenance (
    provenance_id VARCHAR(255) PRIMARY KEY,
    decision_id VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    decision_timestamp TIMESTAMP NOT NULL,
    trust_score DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    policy_hash VARCHAR(255) NOT NULL,
    policy_fallback BOOLEAN NOT NULL,
    is_simulation BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_prov_decision_id ON decision_provenance(decision_id);
CREATE INDEX idx_prov_entity_id ON decision_provenance(entity_id);
CREATE INDEX idx_prov_time ON decision_provenance(decision_timestamp);

-- Provenance Signals (Inputs used)
CREATE TABLE decision_provenance_signals (
    id SERIAL PRIMARY KEY,
    provenance_id VARCHAR(255) NOT NULL REFERENCES decision_provenance(provenance_id),
    signal_id VARCHAR(255) NOT NULL,
    signal_type VARCHAR(255) NOT NULL,
    contribution DOUBLE PRECISION,
    severity VARCHAR(50),
    observed_at TIMESTAMP NOT NULL,
    source VARCHAR(255)
);

CREATE INDEX idx_prov_signals_prov_id ON decision_provenance_signals(provenance_id);

-- Provenance Graph Refs (Context)
CREATE TABLE decision_provenance_graph_refs (
    id SERIAL PRIMARY KEY,
    provenance_id VARCHAR(255) NOT NULL REFERENCES decision_provenance(provenance_id),
    campaign_id VARCHAR(255),
    kill_chain_stage VARCHAR(100),
    graph_node_ids JSONB -- List of node IDs
);

CREATE INDEX idx_prov_graph_prov_id ON decision_provenance_graph_refs(provenance_id);

-- Provenance Controls (Outcomes)
CREATE TABLE decision_provenance_controls (
    id SERIAL PRIMARY KEY,
    provenance_id VARCHAR(255) NOT NULL REFERENCES decision_provenance(provenance_id),
    control_id VARCHAR(255), -- Nullable if simulated
    control_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- APPLIED, REVOKED, SIMULATED
    reason TEXT
);

CREATE INDEX idx_prov_controls_prov_id ON decision_provenance_controls(provenance_id);
