-- Main INSIGHT-X database
CREATE DATABASE insightx;

-- Provenance separate database
CREATE DATABASE insightx_provenance;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE insightx TO insightx;
GRANT ALL PRIVILEGES ON DATABASE insightx_provenance TO insightx;

-- Confirm creation
\l
