package com.insightx.trust.graph;

import com.insightx.trust.domain.TrustEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service to manage the temporal behavioral graph.
 * 
 * <p>
 * Corresponds to FR-4.1 and FR-4.2.
 */
@Service
public class TemporalGraphService {

    private static final Logger logger = LoggerFactory.getLogger(TemporalGraphService.class);

    // In-memory graph storage for now
    private final ConcurrentHashMap<String, GraphNode> nodes = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<GraphEdge> edges = new CopyOnWriteArrayList<>();

    /**
     * Updates the graph based on a new trust event.
     * 
     * @param event The trust event.
     */
    public void updateGraph(TrustEvent event) {
        logger.debug("Updating graph with event: {}", event.eventId());

        // Ensure User Node exists
        nodes.putIfAbsent(event.userId(), new GraphNode(event.userId(), "USER", null));

        // If there's a resource involved, create a Resource Node and an Edge
        if (event.details().containsKey("resourceId")) {
            String resourceId = (String) event.details().get("resourceId");
            nodes.putIfAbsent(resourceId, new GraphNode(resourceId, "RESOURCE", null));

            edges.add(new GraphEdge(
                    event.userId(),
                    resourceId,
                    event.eventType(),
                    event.timestamp(),
                    null));
        }
    }

    /**
     * Finds related nodes for a given node within a time window.
     * (Placeholder for graph traversal logic)
     */
    public List<GraphNode> findRelated(String nodeId) {
        // Simple 1-hop traversal
        List<GraphNode> related = new ArrayList<>();
        for (GraphEdge edge : edges) {
            if (edge.sourceId().equals(nodeId)) {
                GraphNode target = nodes.get(edge.targetId());
                if (target != null)
                    related.add(target);
            }
        }
        return related;
    }
}
