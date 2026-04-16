package com.insightx.stream.integration;

import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.trust.domain.TrustDecision;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

/**
 * SSE Streaming Verification Test
 * Validates Server-Sent Events endpoints for real-time data streaming
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
public class StreamingVerificationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    public void testTrustDecisionStreamEndpoint() {
        Flux<String> eventStream = webTestClient.get()
                .uri("/stream/trust-decisions")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(String.class)
                .getResponseBody();

        // Verify stream is established (take first event or timeout)
        StepVerifier.create(eventStream.take(1))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    public void testControlsStreamEndpoint() {
        Flux<String> eventStream = webTestClient.get()
                .uri("/stream/controls")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(String.class)
                .getResponseBody();

        // Verify stream connectivity
        StepVerifier.create(eventStream.take(Duration.ofSeconds(2)))
                .expectComplete()
                .verify();
    }

    @Test
    public void testProvenanceStreamEndpoint() {
        Flux<String> eventStream = webTestClient.get()
                .uri("/stream/provenance")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(String.class)
                .getResponseBody();

        // Verify stream connectivity
        StepVerifier.create(eventStream.take(Duration.ofSeconds(2)))
                .expectComplete()
                .verify();
    }
}
