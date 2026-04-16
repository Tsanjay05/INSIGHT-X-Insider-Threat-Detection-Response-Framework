package com.insightx.controls.connector.soar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class StubSoarAdapter implements SoarIntegration {

    private static final Logger logger = LoggerFactory.getLogger(StubSoarAdapter.class);

    @Override
    public Mono<String> triggerPlaybook(String incidentId, String playbookName, Object context) {
        String executionId = UUID.randomUUID().toString();
        logger.info("[SOAR] Triggering playbook '{}' for incident '{}'. ExecutionID: {}", playbookName, incidentId,
                executionId);
        // Simulate async external call
        return Mono.just(executionId);
    }

    @Override
    public String systemName() {
        return "Splunk-Phantom-Stub";
    }
}
