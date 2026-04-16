-- INSIGHT-X PostgreSQL Schema Migration V007
-- Add audit triggers for tracking all changes to trust state

-- ============================================================================
-- Create audit log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit.user_trust_state_audit (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    user_id VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Audit metadata
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by VARCHAR(255), -- Database user
    application_user VARCHAR(255), -- Application user (from context)
    source_ip INET,
    
    -- Old and new values
    old_values JSONB,
    new_values JSONB,
    
    -- Change details
    changed_columns TEXT[],
    trust_score_delta DECIMAL(5,4),
    
    -- Additional context
    transaction_id BIGINT DEFAULT txid_current(),
    session_id TEXT DEFAULT current_setting('application_name', true)
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_user_id ON audit.user_trust_state_audit(user_id);
CREATE INDEX idx_audit_changed_at ON audit.user_trust_state_audit(changed_at DESC);
CREATE INDEX idx_audit_record_id ON audit.user_trust_state_audit(record_id);
CREATE INDEX idx_audit_operation ON audit.user_trust_state_audit(operation);
CREATE INDEX idx_audit_trust_delta ON audit.user_trust_state_audit(trust_score_delta) WHERE ABS(trust_score_delta) > 0.1;

-- Partition audit table by month for better performance
ALTER TABLE audit.user_trust_state_audit 
    PARTITION BY RANGE (changed_at);

-- Create audit partitions
CREATE TABLE audit.user_trust_state_audit_2026_02 
    PARTITION OF audit.user_trust_state_audit
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE audit.user_trust_state_audit_2026_03 
    PARTITION OF audit.user_trust_state_audit
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE audit.user_trust_state_audit_2026_04 
    PARTITION OF audit.user_trust_state_audit
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- ============================================================================
-- Create audit trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION audit.log_user_trust_state_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_json JSONB;
    new_json JSONB;
    changed_cols TEXT[];
    trust_delta DECIMAL(5,4);
    app_user TEXT;
    client_ip TEXT;
BEGIN
    -- Get application context (set by application)
    BEGIN
        app_user := current_setting('insightx.user_id', true);
        client_ip := current_setting('insightx.client_ip', true);
    EXCEPTION WHEN OTHERS THEN
        app_user := NULL;
        client_ip := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        old_json := row_to_json(OLD)::JSONB;
        
        INSERT INTO audit.user_trust_state_audit (
            operation,
            user_id,
            record_id,
            changed_by,
            application_user,
            source_ip,
            old_values,
            new_values,
            trust_score_delta
        ) VALUES (
            'DELETE',
            OLD.user_id,
            OLD.id,
            current_user,
            app_user,
            client_ip::INET,
            old_json,
            NULL,
            NULL
        );
        
        RETURN OLD;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        old_json := row_to_json(OLD)::JSONB;
        new_json := row_to_json(NEW)::JSONB;
        
        -- Detect changed columns
        SELECT ARRAY_AGG(key)
        INTO changed_cols
        FROM (
            SELECT key
            FROM jsonb_each(old_json)
            WHERE old_json->key IS DISTINCT FROM new_json->key
        ) AS changed;
        
        -- Calculate trust score delta
        trust_delta := NEW.trust_score - OLD.trust_score;
        
        INSERT INTO audit.user_trust_state_audit (
            operation,
            user_id,
            record_id,
            changed_by,
            application_user,
            source_ip,
            old_values,
            new_values,
            changed_columns,
            trust_score_delta
        ) VALUES (
            'UPDATE',
            NEW.user_id,
            NEW.id,
            current_user,
            app_user,
            client_ip::INET,
            old_json,
            new_json,
            changed_cols,
            trust_delta
        );
        
        RETURN NEW;
        
    ELSIF (TG_OP = 'INSERT') THEN
        new_json := row_to_json(NEW)::JSONB;
        
        INSERT INTO audit.user_trust_state_audit (
            operation,
            user_id,
            record_id,
            changed_by,
            application_user,
            source_ip,
            old_values,
            new_values,
            trust_score_delta
        ) VALUES (
            'INSERT',
            NEW.user_id,
            NEW.id,
            current_user,
            app_user,
            client_ip::INET,
            NULL,
            new_json,
            NEW.trust_score
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Attach triggers to tables
-- ============================================================================

-- Trigger for user_trust_state
CREATE TRIGGER user_trust_state_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_trust_state
    FOR EACH ROW
    EXECUTE FUNCTION audit.log_user_trust_state_changes();

-- ============================================================================
-- Create audit query helper functions
-- ============================================================================

-- Get audit trail for a specific user
CREATE OR REPLACE FUNCTION audit.get_user_trust_audit_trail(
    p_user_id VARCHAR,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    audit_id UUID,
    operation VARCHAR,
    changed_at TIMESTAMPTZ,
    changed_by VARCHAR,
    old_trust_score DECIMAL,
    new_trust_score DECIMAL,
    trust_delta DECIMAL,
    provenance JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.audit_id,
        a.operation,
        a.changed_at,
        a.changed_by,
        (a.old_values->>'trust_score')::DECIMAL AS old_trust_score,
        (a.new_values->>'trust_score')::DECIMAL AS new_trust_score,
        a.trust_score_delta,
        a.new_values->'provenance' AS provenance
    FROM audit.user_trust_state_audit a
    WHERE a.user_id = p_user_id
      AND a.changed_at BETWEEN p_start_date AND p_end_date
    ORDER BY a.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get significant trust score changes (>= 10% change)
CREATE OR REPLACE FUNCTION audit.get_significant_trust_changes(
    p_threshold DECIMAL DEFAULT 0.1,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
    user_id VARCHAR,
    change_count BIGINT,
    total_delta DECIMAL,
    avg_delta DECIMAL,
    max_delta DECIMAL,
    min_delta DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.user_id,
        COUNT(*) AS change_count,
        SUM(a.trust_score_delta) AS total_delta,
        AVG(a.trust_score_delta) AS avg_delta,
        MAX(a.trust_score_delta) AS max_delta,
        MIN(a.trust_score_delta) AS min_delta
    FROM audit.user_trust_state_audit a
    WHERE a.operation = 'UPDATE'
      AND ABS(a.trust_score_delta) >= p_threshold
      AND a.changed_at >= p_start_date
    GROUP BY a.user_id
    ORDER BY total_delta ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Audit retention policy (delete old audit records)
-- ============================================================================

CREATE OR REPLACE FUNCTION audit.cleanup_old_audit_records(
    p_retention_days INTEGER DEFAULT 365
)
RETURNS BIGINT AS $$
DECLARE
    deleted_count BIGINT;
BEGIN
    DELETE FROM audit.user_trust_state_audit
    WHERE changed_at < NOW() - (p_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old audit records older than % days', deleted_count, p_retention_days;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Application user should have SELECT on audit table
GRANT SELECT ON audit.user_trust_state_audit TO insightx_app;
GRANT EXECUTE ON FUNCTION audit.get_user_trust_audit_trail TO insightx_app;
GRANT EXECUTE ON FUNCTION audit.get_significant_trust_changes TO insightx_app;

-- Only admin can clean up audit records
GRANT EXECUTE ON FUNCTION audit.cleanup_old_audit_records TO insightx_admin;
