-- INSIGHT-X PostgreSQL Schema Migration V008
-- Add optimized indexes for common query patterns

-- ============================================================================
-- Composite indexes for common JOIN patterns
-- ============================================================================

-- Trust state queries by user and time range
CREATE INDEX CONCURRENTLY idx_user_trust_user_time 
    ON user_trust_state(user_id, computed_at DESC)
    INCLUDE (trust_score);

-- Risk indicators by user, severity, and time
CREATE INDEX CONCURRENTLY idx_risk_user_severity_time
    ON risk_indicators(user_id, severity, created_at DESC)
    WHERE severity IN ('high', 'critical');

-- Policy decisions by user and policy
CREATE INDEX CONCURRENTLY idx_policy_user_policy
    ON policy_decisions(user_id, policy_id, created_at DESC);

-- Human approvals by status (for pending approvals query)
CREATE INDEX CONCURRENTLY idx_approvals_status_time
    ON human_approvals(status, requested_at DESC)
    WHERE status = 'pending';

-- ============================================================================
-- JSONB indexes for provenance querying
-- ============================================================================

-- GIN index for full-text search in provenance
CREATE INDEX CONCURRENTLY idx_user_trust_provenance_gin
    ON user_trust_state USING GIN (provenance jsonb_path_ops);

CREATE INDEX CONCURRENTLY idx_risk_provenance_gin
    ON risk_indicators USING GIN (provenance jsonb_path_ops);

CREATE INDEX CONCURRENTLY idx_policy_provenance_gin
    ON policy_decisions USING GIN (provenance jsonb_path_ops);

-- Specific JSONB path indexes for common queries
CREATE INDEX CONCURRENTLY idx_user_trust_signal_count
    ON user_trust_state ((provenance->>'signal_count')::INTEGER)
    WHERE provenance ? 'signal_count';

CREATE INDEX CONCURRENTLY idx_risk_confidence
    ON risk_indicators ((value->>'confidence')::DECIMAL)
    WHERE value ? 'confidence';

-- ============================================================================
-- Partial indexes for active/recent data
-- ============================================================================

-- Recent trust state (last 30 days)
CREATE INDEX CONCURRENTLY idx_user_trust_recent
    ON user_trust_state(user_id, computed_at DESC)
    WHERE computed_at > NOW() - INTERVAL '30 days';

-- Low trust scores (requires immediate attention)
CREATE INDEX CONCURRENTLY idx_user_trust_low_score
    ON user_trust_state(user_id, trust_score, computed_at DESC)
    WHERE trust_score < 0.5;

-- Critical risk indicators
CREATE INDEX CONCURRENTLY idx_risk_critical
    ON risk_indicators(user_id, created_at DESC)
    WHERE severity = 'critical';

-- ============================================================================
-- Indexes for analytics queries
-- ============================================================================

-- Trust score distribution analysis
CREATE INDEX CONCURRENTLY idx_trust_score_bucket
    ON user_trust_state(WIDTH_BUCKET(trust_score, 0, 1, 10), computed_at);

-- Approval performance metrics
CREATE INDEX CONCURRENTLY idx_approval_sla
    ON human_approvals(requested_at, decided_at)
    WHERE decided_at IS NOT NULL;

-- ============================================================================
-- Covering indexes for common read-heavy queries
-- ============================================================================

-- Get latest trust score for user (no table lookup needed)
CREATE INDEX CONCURRENTLY idx_user_trust_latest_covering
    ON user_trust_state(user_id, computed_at DESC)
    INCLUDE (id, trust_score, provenance);

-- Get user's risk summary
CREATE INDEX CONCURRENTLY idx_risk_summary_covering
    ON risk_indicators(user_id, created_at DESC)
    INCLUDE (indicator_type, severity, value);

-- ============================================================================
-- Statistics refresh for query planner
-- ============================================================================

ANALYZE user_trust_state;
ANALYZE risk_indicators;
ANALYZE policy_decisions;
ANALYZE human_approvals;

-- ============================================================================
-- Create materialized view for trust score trending
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trust_score_daily AS
SELECT 
    user_id,
    DATE_TRUNC('day', computed_at) AS date,
    AVG(trust_score) AS avg_trust_score,
    MIN(trust_score) AS min_trust_score,
    MAX(trust_score) AS max_trust_score,
    STDDEV(trust_score) AS stddev_trust_score,
    COUNT(*) AS score_count
FROM user_trust_state
GROUP BY user_id, DATE_TRUNC('day', computed_at);

CREATE UNIQUE INDEX ON mv_trust_score_daily(user_id, date);
CREATE INDEX ON mv_trust_score_daily(date DESC);
CREATE INDEX ON mv_trust_score_daily(avg_trust_score) WHERE avg_trust_score < 0.5;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_trust_score_daily()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trust_score_daily;
    RAISE NOTICE 'Refreshed materialized view mv_trust_score_daily';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Index usage statistics query (for monitoring)
-- ============================================================================

CREATE OR REPLACE VIEW v_index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
    END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
