CREATE TABLE intent_hypotheses (
    hypothesis_id UUID PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    evidence_refs JSONB NOT NULL,
    decay_metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_intent_entity_id ON intent_hypotheses(entity_id);
