-- Refactor Trust Decision table to match advanced repository implementation
ALTER TABLE trust_decision RENAME COLUMN id TO internal_id;
ALTER TABLE trust_decision ADD COLUMN decision_id VARCHAR(255);
ALTER TABLE trust_decision RENAME COLUMN decision TO risk_level;
ALTER TABLE trust_decision ADD COLUMN confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE trust_decision ADD COLUMN human_in_loop_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE trust_decision ADD COLUMN applied_policies_json JSONB;
ALTER TABLE trust_decision RENAME COLUMN rationale TO reasons_json;
-- Convert reasons_json from TEXT to JSONB if it's not already
ALTER TABLE trust_decision ALTER COLUMN reasons_json TYPE JSONB USING reasons_json::jsonb;
ALTER TABLE trust_decision RENAME COLUMN timestamp TO created_at;

-- Populate decision_id for existing rows if any
UPDATE trust_decision SET decision_id = internal_id::text WHERE decision_id IS NULL;
ALTER TABLE trust_decision ALTER COLUMN decision_id SET NOT NULL;
CREATE UNIQUE INDEX idx_trust_decision_id ON trust_decision(decision_id);

-- Refactor Trust State table
ALTER TABLE trust_state ALTER COLUMN history_summary_json TYPE JSONB USING history_summary_json::jsonb;
