// INSIGHT-X Neo4j APOC Procedures Configuration
// Custom procedures for graph analytics and automation

// ============================================================================
// AUTOMATED GRAPH MAINTENANCE PROCEDURES
// ============================================================================

// Procedure: Clean up old event nodes (older than 90 days)
CALL apoc.periodic.iterate(
  "MATCH (e:Event) WHERE e.timestamp < datetime() - duration({days: 90}) RETURN e",
  "DETACH DELETE e",
  {batchSize: 1000, parallel: false, iterateList: true}
);

// Procedure: Update peer group similarity scores daily
CALL apoc.periodic.repeat(
  'update-similarity-scores',
  "MATCH (u1:User)-[:COLLABORATED_WITH]-(u2:User)
   WITH u1, u2, COUNT(*) AS collaboration_count
   WHERE collaboration_count > 5
   MERGE (u1)-[s:SIMILAR_TO]-(u2)
   SET s.similarity_score = collaboration_count * 0.1,
       s.last_updated = datetime()",
  86400  // Run daily (86400 seconds)
);

// ============================================================================
// GRAPH ANALYTICS PROCEDURES
// ============================================================================

// Find users with anomalous access patterns (accessing resources outside peer group)
CREATE OR REPLACE FUNCTION findAnomalousAccess(userId STRING)
  RETURNS (anomalous_resources LIST<STRING>)
  LANGUAGE CYPHER AS $$
    MATCH (u:User {user_id: $userId})-[:ACCESSED]->(r:Resource)
    WHERE NOT EXISTS {
      MATCH (u)-[:SIMILAR_TO]-(peer:User)-[:ACCESSED]->(r)
    }
    RETURN COLLECT(DISTINCT r.resource_id) AS anomalous_resources
  $$;

// Calculate trust score based on graph relationships
CREATE OR REPLACE FUNCTION calculateGraphTrustScore(userId STRING)
  RETURNS (trust_score FLOAT)
  LANGUAGE CYPHER AS $$
    MATCH (u:User {user_id: $userId})
    OPTIONAL MATCH (u)-[ACCESSED]->(r:Resource {classification: 'CRITICAL'})
    WITH u, COUNT(r) AS critical_accesses
    OPTIONAL MATCH (u)-[:COLLABORATED_WITH]-(peer:User)
    WITH u, critical_accesses, COUNT(peer) AS peer_count
    OPTIONAL MATCH (u)-[event:TRIGGERED_EVENT]->(e:Event {severity: 'high'})
    WHERE event.timestamp > datetime() - duration({days: 30})
    WITH critical_accesses, peer_count, COUNT(e) AS high_severity_events
    RETURN 1.0 - 
           (critical_accesses * 0.1) - 
           (high_severity_events * 0.15) + 
           (peer_count * 0.02) AS trust_score
  $$;

// ============================================================================
// APOC TRIGGERS
// ============================================================================

// Trigger: Auto-create SIMILAR_TO relationships
CALL apoc.trigger.add(
  'auto-create-similarity',
  "UNWIND $createdRelationships AS rel
   WITH startNode(rel) AS user1, endNode(rel) AS user2
   WHERE type(rel) = 'COLLABORATED_WITH'
   MATCH (user1)-[collab]-(user2)
   WITH user1, user2, COUNT(collab) AS collab_count
   WHERE collab_count >= 5
   MERGE (user1)-[sim:SIMILAR_TO]-(user2)
   ON CREATE SET sim.similarity_score = collab_count * 0.1,
                 sim.created_at = datetime()
   ON MATCH SET sim.similarity_score = collab_count * 0.1,
                sim.updated_at = datetime()",
  {phase: 'after'}
);

// Trigger: Maintain event count on users
CALL apoc.trigger.add(
  'update-event-count',
  "UNWIND $createdNodes AS node
   WITH node WHERE 'Event' IN labels(node)
   MATCH (u:User {user_id: node.user_id})
   SET u.event_count = COALESCE(u.event_count, 0) + 1,
       u.last_event_timestamp = node.timestamp",
  {phase: 'after'}
);

// ============================================================================
// PERIODIC COMMIT BATCH OPERATIONS
// ============================================================================

// Bulk import from Kafka (called via application)
CREATE OR REPLACE PROCEDURE bulkImportEvents(events LIST<MAP>)
{
  CALL apoc.periodic.iterate(
    "UNWIND $events AS event RETURN event",
    "MERGE (e:Event {event_id: event.event_id})
     SET e.timestamp = datetime(event.timestamp),
         e.event_type = event.event_type,
         e.user_id = event.user_id,
         e.metadata = event.metadata
     WITH e, event
     MATCH (u:User {user_id: event.user_id})
     MERGE (u)-[r:TRIGGERED_EVENT]->(e)
     SET r.timestamp = e.timestamp",
    {batchSize: 500, parallel: true, params: {events: $events}}
  );
}

// ============================================================================
// GRAPH DATA SCIENCE PROCEDURES
// ============================================================================

// Create graph projection for PageRank (user influence)
CALL gds.graph.project(
  'user-influence-graph',
  'User',
  {
    COLLABORATED_WITH: {type: 'COLLABORATED_WITH', properties: 'strength'},
    SIMILAR_TO: {type: 'SIMILAR_TO', properties: 'similarity_score'}
  }
);

// Run PageRank to identify influential users
CALL gds.pageRank.write(
  'user-influence-graph',
  {
    writeProperty: 'influence_score',
    maxIterations: 20,
    dampingFactor: 0.85
  }
);

// Community detection using Louvain algorithm
CALL gds.louvain.write(
  'user-influence-graph',
  {
    writeProperty: 'community_id',
    includeIntermediateCommunities: false
  }
);

// ============================================================================
// SHORTEST PATH AND RELATIONSHIP STRENGTH
// ============================================================================

// Find relationship path between two users
CREATE OR REPLACE PROCEDURE findRelationshipPath(
  userId1 STRING,
  userId2 STRING
)
{
  MATCH path = shortestPath(
    (u1:User {user_id: $userId1})-[*]-(u2:User {user_id: $userId2})
  )
  RETURN nodes(path) AS path_nodes,
         relationships(path) AS path_relationships,
         length(path) AS path_length;
}

// ============================================================================
// EXPORT PROCEDURES (for backup and analytics)
// ============================================================================

// Export user graph to JSON
CALL apoc.export.json.query(
  "MATCH (u:User)-[r]-(n)
   RETURN u, r, n",
  "/var/lib/neo4j/export/user_graph_export.json",
  {useTypes: true, storeNodeIds: true}
);

// Export event graph to CSV
CALL apoc.export.csv.query(
  "MATCH (u:User)-[r:TRIGGERED_EVENT]->(e:Event)
   RETURN u.user_id, e.event_id, e.timestamp, e.event_type",
  "/var/lib/neo4j/export/events_export.csv",
  {}
);
