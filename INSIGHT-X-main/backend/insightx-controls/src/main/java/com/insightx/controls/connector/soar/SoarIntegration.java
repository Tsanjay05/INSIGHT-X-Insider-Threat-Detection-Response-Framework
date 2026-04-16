package com.insightx.controls.connector.soar;

import reactor.core.publisher.Mono;

public interface SoarIntegration {
    Mono<String> triggerPlaybook(String incidentId, String playbookName, Object context);

    String systemName();
}
