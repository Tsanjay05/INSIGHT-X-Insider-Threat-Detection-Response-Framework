-- INSIGHT-X PostgreSQL Schema Migration V009
-- Configure streaming replication setup

-- ============================================================================
-- Create replication user
-- ============================================================================

-- Create replication role (run on primary)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
        CREATE ROLE replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD '${REPLICATION_PASSWORD}';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE insightx_trust TO replicator;

-- ============================================================================
-- Create replication slots (run on primary)
-- ============================================================================

-- Physical replication slot for replica 1
SELECT pg_create_physical_replication_slot('replica_1_slot')
WHERE NOT EXISTS (
    SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_1_slot'
);

-- Physical replication slot for replica 2
SELECT pg_create_physical_replication_slot('replica_2_slot')
WHERE NOT EXISTS (
    SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_2_slot'
);

-- ============================================================================
-- Monitoring views
-- ============================================================================

-- View replication lag
CREATE OR REPLACE VIEW v_replication_status AS
SELECT 
    client_addr,
    application_name,
    state,
    sync_state,
    pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) AS send_lag_bytes,
    pg_wal_lsn_diff(sent_lsn, write_lsn) AS write_lag_bytes,
    pg_wal_lsn_diff(write_lsn, flush_lsn) AS flush_lag_bytes,
    pg_wal_lsn_diff(flush_lsn, replay_lsn) AS replay_lag_bytes,
    write_lag,
    flush_lag,
    replay_lag,
    backend_start,
    EXTRACT(EPOCH FROM (NOW() - backend_start)) AS connection_duration_seconds
FROM pg_stat_replication;

-- View replication slots status
CREATE OR REPLACE VIEW v_replication_slots_status AS
SELECT 
    slot_name,
    slot_type,
    database,
    active,
    pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS lag_bytes,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS lag_size
FROM pg_replication_slots;

-- ============================================================================
-- Replication health check function
-- ============================================================================

CREATE OR REPLACE FUNCTION check_replication_health()
RETURNS TABLE (
    replica VARCHAR,
    status VARCHAR,
    lag_seconds NUMERIC,
    lag_bytes BIGINT,
    health_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        application_name::VARCHAR AS replica,
        state::VARCHAR,
        EXTRACT(EPOCH FROM replay_lag)::NUMERIC AS lag_seconds,
        pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes,
        CASE 
            WHEN state != 'streaming' THEN 'CRITICAL'
            WHEN EXTRACT(EPOCH FROM replay_lag) > 60 THEN 'WARNING'
            WHEN pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) > 104857600 THEN 'WARNING' -- >100MB
            ELSE 'HEALTHY'
        END::VARCHAR AS health_status
    FROM pg_stat_replication;
    
    IF NOT FOUND THEN
        -- No replicas connected
        RETURN QUERY SELECT 
            'NO_REPLICAS'::VARCHAR,
            'DISCONNECTED'::VARCHAR,
            NULL::NUMERIC,
            NULL::BIGINT,
            'CRITICAL'::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Promotion function (promote replica to primary)
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_to_primary()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function should be called on the replica to promote it
    -- In practice, you'd use pg_ctl promote or pg_promote()
    
    -- Check if this is a standby server
    IF pg_is_in_recovery() THEN
        PERFORM pg_promote();
        RAISE NOTICE 'Promotion initiated. Server will restart as primary.';
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Server is already primary.';
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- WAL archiving metadata table
-- ============================================================================

CREATE TABLE IF NOT EXISTS replication_metadata (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    wal_position PG_LSN,
    details JSONB,
    created_by VARCHAR(255) DEFAULT current_user
);

CREATE INDEX idx_replication_metadata_time ON replication_metadata(event_time DESC);
CREATE INDEX idx_replication_metadata_type ON replication_metadata(event_type);

-- Function to log replication events
CREATE OR REPLACE FUNCTION log_replication_event(
    p_event_type VARCHAR,
    p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO replication_metadata (event_type, wal_position, details)
    VALUES (p_event_type, pg_current_wal_lsn(), p_details);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON v_replication_status TO insightx_app;
GRANT SELECT ON v_replication_slots_status TO insightx_app;
GRANT EXECUTE ON FUNCTION check_replication_health() TO insightx_app;
GRANT SELECT ON replication_metadata TO insightx_app;
