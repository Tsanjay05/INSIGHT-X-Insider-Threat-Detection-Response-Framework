package com.insightx.gateway.controller;

import com.insightx.gateway.api.TrustEvaluationRequest;
import com.insightx.gateway.api.TrustEvaluationResponse;
import com.insightx.gateway.client.TrustEngineClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

import com.insightx.gateway.config.GatewayRoutesConfig;
import org.springframework.context.annotation.Import;

@WebFluxTest(TrustGatewayController.class)
@Import(GatewayRoutesConfig.class)
class TrustGatewayControllerTest {

        @Autowired
        private WebTestClient webTestClient;

        @MockBean
        private TrustEngineClient trustEngineClient;

        @Test
        @WithMockUser
        void evaluateTrust_ShouldForwardToTrustEngine() {
                TrustEvaluationRequest request = new TrustEvaluationRequest(
                                "entity-1", List.of(), Instant.now());

                TrustEvaluationResponse response = new TrustEvaluationResponse(
                                new TrustEvaluationResponse.Decision("dec-1", "entity-1",
                                                new TrustEvaluationResponse.TrustScore(80.0, 0.9), "LOW", List.of(),
                                                false, List.of()),
                                Map.of(),
                                List.of());

                when(trustEngineClient.evaluateTrust(any())).thenReturn(Mono.just(response));

                webTestClient.mutateWith(csrf())
                                .post().uri("/api/trust/evaluate")
                                .bodyValue(request)
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody(TrustEvaluationResponse.class)
                                .isEqualTo(response);
        }
}
