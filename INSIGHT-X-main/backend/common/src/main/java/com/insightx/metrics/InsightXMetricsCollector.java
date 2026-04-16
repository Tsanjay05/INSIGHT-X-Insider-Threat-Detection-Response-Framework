package com.insightx.metrics;

import io.micrometer.core.instrument.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Centralized metrics collector for INSIGHT-X services
 */
@Component
@RequiredArgsConstructor
public class InsightXMetricsCollector {
    
    private final MeterRegistry meterRegistry;
    
    /**
     * Record trust score calculation time
     */
    public void recordTrustCalculationTime(Duration duration) {
        Timer.builder("trust.calculation.time")
                .description("Time taken to calculate trust score")
                .register(meterRegistry)
                .record(duration);
    }
    
    /**
     * Record trust score value
     */
    public void recordTrustScore(String userId, double trustScore) {
        Gauge.builder("trust.score", () -> trustScore)
                .tag("user_id", userId)
                .description("Current trust score for user")
                .register(meterRegistry);
    }
    
    /**
     * Increment event processing counter
     */
    public void incrementEventProcessed(String eventType, String status) {
        Counter.builder("events.processed")
                .tag("event_type", eventType)
                .tag("status", status)
                .description("Count of processed events")
                .register(meterRegistry)
                .increment();
    }
    
    /**
     * Record policy evaluation time
     */
    public void recordPolicyEvaluationTime(String policyName, Duration duration) {
        Timer.builder("policy.evaluation.time")
                .tag("policy", policyName)
                .description("Time taken to evaluate OPA policy")
                .register(meterRegistry)
                .record(duration);
    }
    
    /**
     * Record control action
     */
    public void recordControlAction(String actionType, String outcome) {
        Counter.builder("control.actions")
                .tag("action_type", actionType)
                .tag("outcome", outcome)
                .description("Count of control actions taken")
                .register(meterRegistry)
                .increment();
    }
    
    /**
     * Record graph query time
     */
    public void recordGraphQueryTime(String queryType, Duration duration) {
        Timer.builder("graph.query.time")
                .tag("query_type", queryType)
                .description("Time taken for Neo4j graph queries")
                .register(meterRegistry)
                .record(duration);
    }
    
    /**
     * Record risk indicator count
     */
    public void recordRiskIndicatorCount(String userId, int count) {
        Gauge.builder("risk.indicators.count", () -> count)
                .tag("user_id", userId)
                .description("Number of active risk indicators for user")
                .register(meterRegistry);
    }
    
    /**
     * Record connector health
     */
    public void recordConnectorHealth(String connectorType, boolean isHealthy) {
        Gauge.builder("connector.health", () -> isHealthy ? 1.0 : 0.0)
                .tag("connector_type", connectorType)
                .description("Connector health status (1=healthy, 0=unhealthy)")
                .register(meterRegistry);
    }
}
