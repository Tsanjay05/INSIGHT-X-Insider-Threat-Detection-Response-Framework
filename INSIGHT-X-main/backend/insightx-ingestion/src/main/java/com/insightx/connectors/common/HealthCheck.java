package com.insightx.connectors.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheck {
    private HealthStatus status;
    private String message;
    private Instant lastChecked;
    private Long eventCount;
    private Long errorCount;
    private Double successRate;

    public enum HealthStatus {
        HEALTHY,
        DEGRADED,
        UNHEALTHY,
        UNKNOWN
    }

    public boolean isHealthy() {
        return status == HealthStatus.HEALTHY;
    }
}
