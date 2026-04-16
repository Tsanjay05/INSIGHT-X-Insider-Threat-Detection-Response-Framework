package com.insightx.trust.graph;

import java.util.Map;

/**
 * Represents a node in the temporal behavioral graph.
 * 
 * <p>
 * Corresponds to FR-4.1.
 */
public record GraphNode(
        String id,
        String type, // e.g., "USER", "DEVICE", "FILE", "IP"
        Map<String, Object> properties) {
}
