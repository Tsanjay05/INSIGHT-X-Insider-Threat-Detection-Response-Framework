// INSIGHT-X Neo4j Graph Schema
// User↔resource, User↔role, Resource↔data, Behavioral relationship edges

// Constraints
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT resource_id IF NOT EXISTS FOR (r:Resource) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT role_id IF NOT EXISTS FOR (r:Role) REQUIRE r.id IS UNIQUE;

// Indexes for graph traversal
CREATE INDEX user_created IF NOT EXISTS FOR (u:User) ON (u.created_at);
CREATE INDEX edge_timestamp IF NOT EXISTS FOR ()-[e:ACCESSES]-() ON (e.timestamp);

// Example node/relationship structure (to be populated by Temporal Graph Service):
// (User)-[:HAS_ROLE]->(Role)
// (User)-[:ACCESSES]->(Resource)
// (Resource)-[:CONTAINS_DATA]->(DataAsset)
// (User)-[:BEHAVIORAL_RELATION]->(User)
