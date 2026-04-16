package com.insightx.graph.repository;

import com.insightx.graph.domain.UserNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data Neo4j repository for UserNode entity operations.
 * Provides CRUD operations and graph traversal queries.
 */
@Repository
public interface UserNodeRepository extends Neo4jRepository<UserNode, String> {

    /**
     * Find user node by user ID.
     * 
     * @param userId The unique user identifier
     * @return UserNode if found, null otherwise
     */
    // findById() is inherited from Neo4jRepository

    /**
     * Check if a user node exists.
     * 
     * @param userId The unique user identifier
     * @return true if exists, false otherwise
     */
    boolean existsById(String userId);
}
