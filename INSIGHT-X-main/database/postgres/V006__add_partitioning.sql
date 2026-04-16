-- INSIGHT-X PostgreSQL Schema Migration V006
-- Add table partitioning for large tables (user_trust_state, risk_indicators, policy_decisions)

-- ============================================================================
-- PARTITION user_trust_state BY RANGE (computed_at) - Monthly partitions
-- ============================================================================

-- Create partitioned table
CREATE TABLE user_trust_state_partitioned (
    id UUID DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    trust_score DECIMAL(5,4) NOT NULL CHECK (trust_score >= 0 AND trust_score <= 1),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB,
    PRIMARY KEY (id, computed_at)
) PARTITION BY RANGE (computed_at);

-- Create indexes on partitioned table
CREATE INDEX idx_user_trust_partitioned_user_id ON user_trust_state_partitioned(user_id);
CREATE INDEX idx_user_trust_partitioned_computed_at ON user_trust_state_partitioned(computed_at);
CREATE INDEX idx_user_trust_partitioned_score ON user_trust_state_partitioned(trust_score) WHERE trust_score < 0.5;

-- Create initial partitions (last 6 months + next 6 months)
CREATE TABLE user_trust_state_2025_08 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE user_trust_state_2025_09 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE user_trust_state_2025_10 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE user_trust_state_2025_11 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE user_trust_state_2025_12 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE user_trust_state_2026_01 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE user_trust_state_2026_02 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE user_trust_state_2026_03 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE user_trust_state_2026_04 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE user_trust_state_2026_05 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE user_trust_state_2026_06 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE user_trust_state_2026_07 PARTITION OF user_trust_state_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Migrate existing data from old table to partitioned table
INSERT INTO user_trust_state_partitioned (id, user_id, trust_score, computed_at, provenance)
SELECT id, user_id, trust_score, computed_at, provenance
FROM user_trust_state;

-- Rename tables (keep old table for rollback)
ALTER TABLE user_trust_state RENAME TO user_trust_state_old;
ALTER TABLE user_trust_state_partitioned RENAME TO user_trust_state;

-- ============================================================================
-- PARTITION risk_indicators BY RANGE (created_at) - Daily partitions
-- ============================================================================

-- Create partitioned table
CREATE TABLE risk_indicators_partitioned (
    id UUID DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    indicator_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create indexes on partitioned table
CREATE INDEX idx_risk_partitioned_user_id ON risk_indicators_partitioned(user_id);
CREATE INDEX idx_risk_partitioned_created_at ON risk_indicators_partitioned(created_at);
CREATE INDEX idx_risk_partitioned_severity ON risk_indicators_partitioned(severity) WHERE severity IN ('high', 'critical');

-- Create initial daily partitions (last 30 days + next 30 days)
-- NOTE: In production, use a maintenance job to create these automatically
CREATE TABLE risk_indicators_2026_02_01 PARTITION OF risk_indicators_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-02-02');

CREATE TABLE risk_indicators_2026_02_02 PARTITION OF risk_indicators_partitioned
    FOR VALUES FROM ('2026-02-02') TO ('2026-02-03');

CREATE TABLE risk_indicators_2026_02_03 PARTITION OF risk_indicators_partitioned
    FOR VALUES FROM ('2026-02-03') TO ('2026-02-04');

-- (Additional daily partitions would be created by maintenance job)

-- Migrate existing data
INSERT INTO risk_indicators_partitioned (id, user_id, indicator_type, severity, value, created_at, provenance)
SELECT id, user_id, indicator_type, severity, value, created_at, provenance
FROM risk_indicators
WHERE created_at >= '2026-02-01'; -- Only recent data

-- Rename tables
ALTER TABLE risk_indicators RENAME TO risk_indicators_old;
ALTER TABLE risk_indicators_partitioned RENAME TO risk_indicators;

-- ============================================================================
-- PARTITION policy_decisions BY RANGE (created_at) - Monthly partitions
-- ============================================================================

-- Create partitioned table
CREATE TABLE policy_decisions_partitioned (
    id UUID DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    input JSONB,
    output JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provenance JSONB,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create indexes
CREATE INDEX idx_policy_decision_partitioned_user_id ON policy_decisions_partitioned(user_id);
CREATE INDEX idx_policy_decision_partitioned_created_at ON policy_decisions_partitioned(created_at);
CREATE INDEX idx_policy_decision_partitioned_policy_id ON policy_decisions_partitioned(policy_id);

-- Create monthly partitions
CREATE TABLE policy_decisions_2025_08 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE policy_decisions_2025_09 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE policy_decisions_2025_10 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE policy_decisions_2025_11 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE policy_decisions_2025_12 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE policy_decisions_2026_01 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE policy_decisions_2026_02 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE policy_decisions_2026_03 PARTITION OF policy_decisions_partitioned
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Migrate data
INSERT INTO policy_decisions_partitioned (id, user_id, policy_id, decision, input, output, created_at, provenance)
SELECT id, user_id, policy_id, decision, input, output, created_at, provenance
FROM policy_decisions;

-- Rename tables
ALTER TABLE policy_decisions RENAME TO policy_decisions_old;
ALTER TABLE policy_decisions_partitioned RENAME TO policy_decisions;

-- ============================================================================
-- Create function to automatically create future partitions
-- ============================================================================

CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    start_date DATE
) RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_month TEXT;
    end_date DATE;
BEGIN
    start_month := TO_CHAR(start_date, 'YYYY_MM');
    partition_name := table_name || '_' || start_month;
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    RAISE NOTICE 'Created partition % for range [%, %)', partition_name, start_date, end_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Validation queries
-- ============================================================================

-- Verify partitioning
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'user_trust_state%'
   OR tablename LIKE 'risk_indicators%'
   OR tablename LIKE 'policy_decisions%'
ORDER BY tablename;

-- Verify data integrity
SELECT 
    'user_trust_state' AS table_name,
    COUNT(*) AS row_count
FROM user_trust_state
UNION ALL
SELECT 
    'risk_indicators',
    COUNT(*)
FROM risk_indicators
UNION ALL
SELECT 
    'policy_decisions',
    COUNT(*)
FROM policy_decisions;
