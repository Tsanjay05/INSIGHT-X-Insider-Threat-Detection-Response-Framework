CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    resource_id VARCHAR(255),
    details TEXT,
    status VARCHAR(50),
    ip_address VARCHAR(50),
    metadata_json TEXT
);

CREATE INDEX idx_audit_actor ON audit_logs(actor);
CREATE INDEX idx_audit_resource ON audit_logs(resource);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
