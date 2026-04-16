package com.insightx.health;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Health indicator for Kafka connectivity
 */
@Component
@RequiredArgsConstructor
public class KafkaHealthIndicator implements HealthIndicator {
    
    private final org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate;
    private final MeterRegistry meterRegistry;
    
    @Override
    public Health health() {
        try {
            // Check if we can get metadata from Kafka
            var metadata = kafkaTemplate.getProducerFactory()
                    .createProducer()
                    .partitionsFor("insightx.health.check");
            
            Map<String, Object> details = new HashMap<>();
            details.put("kafka_status", "UP");
            details.put("partitions_available", metadata != null ? metadata.size() : 0);
            
            incrementHealthCheckCounter("kafka", "success");
            
            return Health.up()
                    .withDetails(details)
                    .build();
                    
        } catch (Exception e) {
            incrementHealthCheckCounter("kafka", "failure");
            
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
    
    private void incrementHealthCheckCounter(String component, String status) {
        Counter.builder("health_check")
                .tag("component", component)
                .tag("status", status)
                .register(meterRegistry)
                .increment();
    }
}
