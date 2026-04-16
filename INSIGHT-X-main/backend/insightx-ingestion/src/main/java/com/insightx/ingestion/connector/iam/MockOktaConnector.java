package com.insightx.ingestion.connector.iam;

import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class MockOktaConnector implements IamConnector {

    @Override
    public Flux<IamEvent> streamEvents() {
        return Flux.interval(Duration.ofSeconds(10))
                .map(tick -> new IamEvent(
                        UUID.randomUUID().toString(),
                        "user-" + (tick % 5),
                        tick % 2 == 0 ? "LOGIN_SUCCESS" : "LOGIN_FAILURE",
                        Instant.now(),
                        "Okta",
                        Map.of("ip", "192.168.1." + tick)));
    }

    @Override
    public String systemName() {
        return "Okta";
    }
}
