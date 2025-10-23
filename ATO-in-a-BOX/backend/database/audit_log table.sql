-- SQL command to create the audit_log table
CREATE TABLE audit_log (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    origin VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR(100),
    role VARCHAR(100),
    action VARCHAR(255) NOT NULL,
    details TEXT
);

-- Optional: Create an index for faster searching
CREATE INDEX idx_audit_log_timestamp ON audit_log (timestamp DESC);
CREATE INDEX idx_audit_log_action ON audit_log (action);