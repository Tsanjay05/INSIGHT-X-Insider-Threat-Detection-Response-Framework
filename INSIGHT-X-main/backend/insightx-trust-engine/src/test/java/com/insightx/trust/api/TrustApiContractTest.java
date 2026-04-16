package com.insightx.trust.api;

import com.insightx.trust.domain.RiskLevel;
import com.insightx.trust.integration.PostgreSQLTestBase;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * API Contract Tests for Trust Engine REST Endpoints
 * Validates HTTP status codes, response structure, and error handling
 * 
 * <p>
 * Extends PostgreSQLTestBase to use real PostgreSQL for integration testing.
 * </p>
 */
@AutoConfigureWebTestClient
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TrustApiContractTest extends PostgreSQLTestBase {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    @Order(1)
    public void testEvaluateTrustEndpoint_ValidRequest() {
        String requestBody = """
                {
                    "entityId": "user-api-test",
                    "normalizedSignals": [
                        {
                            "id": "sig-123",
                            "type": "BEHAVIORAL",
                            "severity": 0.5,
                            "contribution": -10.0,
                            "description": "API test signal",
                            "source": "TEST",
                            "observedAt": "2025-01-01T10:00:00Z"
                        }
                    ],
                    "evaluationTimestamp": "2025-01-01T10:00:00Z"
                }
                """;

        webTestClient.post()
                .uri("/api/trust/evaluate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.decisionId").exists()
                .jsonPath("$.entityId").isEqualTo("user-api-test")
                .jsonPath("$.riskLevel").exists()
                .jsonPath("$.trustScore").exists()
                .jsonPath("$.confidence").exists();
    }

    @Test
    @Order(2)
    public void testGetTrustStateEndpoint_ExistingUser() {
        String entityId = "user-state-test";

        // First create trust state via evaluation
        String requestBody = """
                {
                    "entityId": "%s",
                    "normalizedSignals": [
                        {
                            "id": "sig-state-test",
                            "type": "DATA_ACCESS",
                            "severity": 0.3,
                            "contribution": 5.0,
                            "description": "State test",
                            "source": "TEST",
                            "observedAt": "2025-01-01T10:00:00Z"
                        }
                    ],
                    "evaluationTimestamp": "2025-01-01T10:00:00Z"
                }
                """.formatted(entityId);

        webTestClient.post()
                .uri("/api/trust/evaluate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .exchange()
                .expectStatus().isOk();

        // Now retrieve trust state
        webTestClient.get()
                .uri("/api/trust/users/" + entityId)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON)
                .expectBody()
                .jsonPath("$.entityId").isEqualTo(entityId)
                .jsonPath("$.trustScore").exists()
                .jsonPath("$.confidence").exists()
                .jsonPath("$.lastUpdated").exists();
    }

    @Test
    @Order(3)
    public void testEvaluateTrustEndpoint_MalformedRequest() {
        String malformedRequest = """
                {
                    "entityId": "test-user"
                }
                """;

        webTestClient.post()
                .uri("/api/trust/evaluate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(malformedRequest)
                .exchange()
                .expectStatus().is4xxClientError();
    }

    @Test
    @Order(4)
    public void testGetTrustStateEndpoint_NonExistentUser() {
        webTestClient.get()
                .uri("/api/trust/users/non-existent-user-12345")
                .exchange()
                .expectStatus().isNotFound();
    }
}
