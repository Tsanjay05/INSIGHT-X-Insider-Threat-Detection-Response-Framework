// INSIGHT-X Neo4j Schema Initialization
// Constraints and indexes for entity relationship graph

// ============================================================================
// CONSTRAINTS - Enforce data integrity
// ============================================================================

// User nodes must have unique user_id
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.user_id IS UNIQUE;

// Event nodes must have unique event_id
CREATE CONSTRAINT event_id_unique IF NOT EXISTS
FOR (e:Event)
REQUIRE e.event_id IS UNIQUE;

// Resource nodes must have unique resource_id
CREATE CONSTRAINT resource_id_unique IF NOT EXISTS
FOR (r:Resource)
REQUIRE r.resource_id IS UNIQUE;

// Entity nodes must have user_id and name
CREATE CONSTRAINT entity_user_required IF NOT EXISTS
FOR (ent:Entity)
REQUIRE ent.user_id IS NOT NULL;

CREATE CONSTRAINT entity_name_required IF NOT EXISTS
FOR (ent:Entity)
REQUIRE ent.name IS NOT NULL;

// Relationship type must exist for Relationship nodes
CREATE CONSTRAINT relationship_type_required IF NOT EXISTS
FOR (rel:Relationship)
REQUIRE rel.relationship_type IS NOT NULL;

// ============================================================================
// INDEXES - Optimize common queries
// ============================================================================

// User indexes
CREATE INDEX user_email_index IF NOT EXISTS
FOR (u:User) ON (u.email);

CREATE INDEX user_department_index IF NOT EXISTS
FOR (u:User) ON (u.department);

CREATE INDEX user_role_index IF NOT EXISTS
FOR (u:User) ON (u.role);

CREATE INDEX user_status_index IF NOT EXISTS
FOR (u:User) ON (u.status);

// Event indexes for time-based queries
CREATE INDEX event_timestamp_index IF NOT EXISTS
FOR (e:Event) ON (e.timestamp);

CREATE INDEX event_type_index IF NOT EXISTS
FOR (e:Event) ON (e.event_type);

CREATE INDEX event_severity_index IF NOT EXISTS
FOR (e:Event) ON (e.severity);

// Composite index for event queries by user and time
CREATE INDEX event_user_time_index IF NOT EXISTS
FOR (e:Event) ON (e.user_id, e.timestamp);

// Resource indexes
CREATE INDEX resource_type_index IF NOT EXISTS
FOR (r:Resource) ON (r.resource_type);

CREATE INDEX resource_classification_index IF NOT EXISTS
FOR (r:Resource) ON (r.classification);

CREATE INDEX resource_owner_index IF NOT EXISTS
FOR (r:Resource) ON (r.owner_id);

// Entity indexes for peer group analysis
CREATE INDEX entity_type_index IF NOT EXISTS
FOR (ent:Entity) ON (ent.entity_type);

CREATE INDEX entity_department_index IF NOT EXISTS
FOR (ent:Entity) ON (ent.department);

// Relationship strength index for weighted graph traversals
CREATE INDEX relationship_strength_index IF NOT EXISTS
FOR (rel:Relationship) ON (rel.strength);

CREATE INDEX relationship_type_index IF NOT EXISTS
FOR (rel:Relationship) ON (rel.relationship_type);

// ==================================================================================================
// FULL-TEXT SEARCH INDEXES
// ============================================================================

// Full-text search on user attributes
CREATE FULLTEXT INDEX user_fulltext_index IF NOT EXISTS
FOR (u:User)
ON EACH [u.name, u.email, u.department, u.title];

// Full-text search on resources
CREATE FULLTEXT INDEX resource_fulltext_index IF NOT EXISTS
FOR (r:Resource)
ON EACH [r.name, r.path, r.description];

// Full-text search on events
CREATE FULLTEXT INDEX event_fulltext_index IF NOT EXISTS
FOR (e:Event)
ON EACH [e.description, e.metadata];

// ============================================================================
// EXISTENCE CONSTRAINTS (Neo4j Enterprise)
// ============================================================================

// User must have essential properties
CREATE CONSTRAINT user_email_exists IF NOT EXISTS
FOR (u:User)
REQUIRE u.email IS NOT NULL;

CREATE CONSTRAINT user_created_at_exists IF NOT EXISTS
FOR (u:User)
REQUIRE u.created_at IS NOT NULL;

// Event must have timestamp
CREATE CONSTRAINT event_timestamp_exists IF NOT EXISTS
FOR (e:Event)
REQUIRE e.timestamp IS NOT NULL;

// Resource must have name
CREATE CONSTRAINT resource_name_exists IF NOT EXISTS
FOR (r:Resource)
REQUIRE r.name IS NOT NULL;

// ============================================================================
// RELATIONSHIP TYPE CONSTRAINTS
// ============================================================================

// ACCESSED relationship must have timestamp
CREATE CONSTRAINT accessed_timestamp_exists IF NOT EXISTS
FOR ()-[r:ACCESSED]-()
REQUIRE r.timestamp IS NOT NULL;

// COLLABORATED_WITH must have strength
CREATE CONSTRAINT collaborated_strength_exists IF NOT EXISTS
FOR ()-[r:COLLABORATED_WITH]-()
REQUIRE r.strength IS NOT NULL;

// SIMILAR_TO must have similarity score
CREATE CONSTRAINT similar_score_exists IF NOT EXISTS
FOR ()-[r:SIMILAR_TO]-()
REQUIRE r.similarity_score IS NOT NULL;

// ============================================================================
// STATISTICS REFRESH
// ============================================================================

// Force Neo4j to update statistics for query planner
CALL db.stats.retrieve("GRAPH");

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Show all constraints
SHOW CONSTRAINTS;

// Show all indexes
SHOW INDEXES;

// Show index statistics
CALL db.indexes();

// Show constraint statistics
CALL db.constraints();
