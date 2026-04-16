package com.insightx.health;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Health indicator for PostgreSQL connectivity
 */
@Component
@RequiredArgsConstructor
public class PostgresHealthIndicator implements ReactiveHealthIndicator {
    
    private final DatabaseClient databaseClient;
    private final MeterRegistry meterRegistry;
    
    @Override
    public Mono<Health> health() {
        return databaseClient.sql("SELECT 1")
                .fetch()
                .one()
                .map(result -> Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("status", "Connected")
                        .build())
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(error -> {
                    meterRegistry.counter("health_check", "component", "postgres", "status", "failure").increment();
                    return Mono.just(Health.down()
                            .withDetail("database", "PostgreSQL")
                            .withDetail("error", error.getMessage())
                            .build());
                })
                .doOnSuccess(health -> {
                    if (health.getStatus() == org.springframework.boot.actuate.health.Status.UP) {
                        meterRegistry.counter("health_check", "component", "postgres", "status", "success").increment();
                    }
                });
    }
}
