package com.insightx.trust.graph;

import java.time.Instant;
import java.util.Map;

/**
 * Represents an edge (relationship) in the temporal behavioral graph.
 * 
 * <p>
 * Corresponds to FR-4.2 (Dynamic behavioral relationship).
 */
public record GraphEdge(
        String sourceId,
        String targetId,
        String type, // e.g., "ACCESSED", "LOGGED_IN", "MODIFIED"
        Instant timestamp,
        Map<String, Object> properties) {
}
