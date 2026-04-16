package com.insightx.connectors.common;

/**
 * Base connector interface for all external system integrations.
 * All connectors must implement this interface for standardized event
 * ingestion.
 */
public interface BaseConnector<T> {

    /**
     * Initialize the connector with required configuration
     * 
     * @param config Connector-specific configuration
     */
    void init(ConnectorConfig config);

    /**
     * Start the connector and begin event streaming
     */
    void start();

    /**
     * Stop the connector gracefully
     */
    void stop();

    /**
     * Check if connector is healthy and able to fetch events
     * 
     * @return HealthCheck status
     */
    HealthCheck checkHealth();

    /**
     * Fetch events from the external system
     * 
     * @return Flux of events
     */
    reactor.core.publisher.Flux<T> fetchEvents();

    /**
     * Get connector metadata
     * 
     * @return ConnectorMetadata
     */
    ConnectorMetadata getMetadata();
}
