package com.insightx.controls.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class MockSoarDispatcher implements SoarDispatcher {

    private static final Logger logger = LoggerFactory.getLogger(MockSoarDispatcher.class);

    @Override
    public Mono<Boolean> dispatch(String actionType, String entityId, String evidenceJson) {
        return Mono.fromRunnable(() -> {
            logger.info("[SOAR] Dispatching action: {} for entity: {}", actionType, entityId);
            // In a real implementation, this would make an HTTP request to Phantom/Cortex
            // XSOAR/Swimlane
        }).thenReturn(true);
    }
}
