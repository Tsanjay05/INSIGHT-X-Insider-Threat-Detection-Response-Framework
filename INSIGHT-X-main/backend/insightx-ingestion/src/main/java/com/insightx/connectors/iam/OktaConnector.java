package com.insightx.connectors.iam;

import com.insightx.connectors.common.*;
import com.insightx.domain.IamEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
public class OktaConnector implements BaseConnector<IamEvent> {

    private WebClient webClient;
    private ConnectorConfig config;
    private final AtomicLong eventCount = new AtomicLong(0);
    private final AtomicLong errorCount = new AtomicLong(0);
    private Instant lastEventTime;

    @Override
    public void init(ConnectorConfig config) {
        log.info("Initializing Okta connector with endpoint: {}", config.getApiEndpoint());
        this.config = config;
        this.webClient = WebClient.builder()
                .baseUrl(config.getApiEndpoint())
                .defaultHeader("Authorization", "SSWS " + config.getApiToken())
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Override
    public void start() {
        log.info("Starting Okta connector");
        // Connector lifecycle managed by Spring
    }

    @Override
    public void stop() {
        log.info("Stopping Okta connector");
    }

    @Override
    public HealthCheck checkHealth() {
        try {
            // Call Okta health endpoint
            Boolean isHealthy = webClient.get()
                    .uri("/api/v1/users/me")
                    .retrieve()
                    .toBodilessEntity()
                    .map(response -> response.getStatusCode().is2xxSuccessful())
                    .block(Duration.ofSeconds(5));

            double successRate = calculateSuccessRate();

            HealthCheck.HealthStatus status;
            if (Boolean.TRUE.equals(isHealthy) && successRate > 0.95) {
                status = HealthCheck.HealthStatus.HEALTHY;
            } else if (successRate > 0.8) {
                status = HealthCheck.HealthStatus.DEGRADED;
            } else {
                status = HealthCheck.HealthStatus.UNHEALTHY;
            }

            return HealthCheck.builder()
                    .status(status)
                    .message("Okta API connection successful")
                    .lastChecked(Instant.now())
                    .eventCount(eventCount.get())
                    .errorCount(errorCount.get())
                    .successRate(successRate)
                    .build();

        } catch (Exception e) {
            log.error("Health check failed", e);
            return HealthCheck.builder()
                    .status(HealthCheck.HealthStatus.UNHEALTHY)
                    .message("Health check failed: " + e.getMessage())
                    .lastChecked(Instant.now())
                    .build();
        }
    }

    @Override
    public Flux<IamEvent> fetchEvents() {
        log.info("Fetching events from Okta System Log API");

        return Flux.interval(Duration.ofSeconds(config.getPollIntervalSeconds()))
                .flatMap(tick -> fetchSystemLogEvents())
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(5))
                        .maxBackoff(Duration.ofMinutes(1))
                        .doBeforeRetry(
                                signal -> log.warn("Retrying Okta API call, attempt: {}", signal.totalRetries())))
                .doOnNext(event -> {
                    eventCount.incrementAndGet();
                    lastEventTime = Instant.now();
                })
                .doOnError(error -> {
                    errorCount.incrementAndGet();
                    log.error("Error fetching Okta events", error);
                });
    }

    private Flux<IamEvent> fetchSystemLogEvents() {
        String since = lastEventTime != null ? lastEventTime.toString()
                : Instant.now().minus(Duration.ofHours(1)).toString();

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/logs")
                        .queryParam("since", since)
                        .queryParam("limit", config.getBatchSize())
                        .queryParam("sortOrder", "ASCENDING")
                        .build())
                .retrieve()
                .bodyToFlux(OktaSystemLogEvent.class)
                .map(this::convertToIamEvent)
                .onErrorResume(error -> {
                    log.error("Error retrieving Okta logs", error);
                    errorCount.incrementAndGet();
                    return Flux.empty();
                });
    }

    private IamEvent convertToIamEvent(OktaSystemLogEvent oktaEvent) {
        return IamEvent.builder()
                .eventId(oktaEvent.getUuid())
                .timestamp(oktaEvent.getPublished())
                .userId(oktaEvent.getActor() != null ? oktaEvent.getActor().getId() : null)
                .eventType(mapEventType(oktaEvent.getEventType()))
                .sourceSystem("okta")
                .sourceIp(oktaEvent.getClient() != null ? oktaEvent.getClient().getIpAddress() : null)
                .userAgent(oktaEvent.getClient() != null ? oktaEvent.getClient().getUserAgent() : null)
                .metadata(java.util.Map.of(
                        "displayMessage", oktaEvent.getDisplayMessage(),
                        "severity", oktaEvent.getSeverity(),
                        "outcome", oktaEvent.getOutcome().getResult()))
                .build();
    }

    private String mapEventType(String oktaEventType) {
        if (oktaEventType.startsWith("user.session.start"))
            return "LOGIN_SUCCESS";
        if (oktaEventType.contains("user.session.end"))
            return "LOGOUT";
        if (oktaEventType.contains("user.authentication.auth_via_mfa"))
            return "MFA_SUCCESS";
        if (oktaEventType.contains("failed"))
            return "LOGIN_FAILURE";
        return "OTHER";
    }

    private double calculateSuccessRate() {
        long total = eventCount.get();
        if (total == 0)
            return 1.0;
        return (double) (total - errorCount.get()) / total;
    }

    @Override
    public ConnectorMetadata getMetadata() {
        return ConnectorMetadata.builder()
                .connectorId(config.getConnectorId())
                .connectorType("okta-iam")
                .version("1.0.0")
                .providerName("Okta")
                .description("Okta System Log API connector for IAM events")
                .supportsRealtime(true)
                .supportsBatch(true)
                .build();
    }

    // Inner class for Okta API response
    @lombok.Data
    private static class OktaSystemLogEvent {
        private String uuid;
        private Instant published;
        private String eventType;
        private String displayMessage;
        private String severity;
        private Actor actor;
        private Client client;
        private Outcome outcome;

        @lombok.Data
        private static class Actor {
            private String id;
            private String alternateId;
            private String displayName;
        }

        @lombok.Data
        private static class Client {
            private String ipAddress;
            private String userAgent;
        }

        @lombok.Data
        private static class Outcome {
            private String result;
            private String reason;
        }
    }
}
