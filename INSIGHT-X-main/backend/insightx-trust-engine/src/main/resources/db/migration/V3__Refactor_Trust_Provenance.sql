-- Refactor Trust Provenance table to match advanced repository implementation
ALTER TABLE trust_provenance RENAME COLUMN id TO internal_id;
ALTER TABLE trust_provenance ADD COLUMN decision_id VARCHAR(255);
ALTER TABLE trust_provenance ADD COLUMN evaluation_started_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE trust_provenance ADD COLUMN evaluation_completed_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE trust_provenance RENAME COLUMN metadata_json TO provenance_json;
ALTER TABLE trust_provenance ALTER COLUMN provenance_json TYPE JSONB USING provenance_json::jsonb;
ALTER TABLE trust_provenance ADD COLUMN policy_version VARCHAR(50) NOT NULL DEFAULT '1.0.0';
-- Drop columns not used by the new repository
ALTER TABLE trust_provenance DROP COLUMN signal_type;
ALTER TABLE trust_provenance DROP COLUMN signal_weight;
ALTER TABLE trust_provenance DROP COLUMN timestamp;
