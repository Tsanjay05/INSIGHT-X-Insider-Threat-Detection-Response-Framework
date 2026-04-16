package com.insightx.gateway.client;

import com.insightx.gateway.api.TrustEvaluationRequest;
import com.insightx.gateway.api.TrustEvaluationResponse;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class TrustEngineClient {

    private final WebClient webClient;

    public TrustEngineClient(WebClient trustEngineWebClient) {
        this.webClient = trustEngineWebClient;
    }

    public Mono<TrustEvaluationResponse> evaluateTrust(TrustEvaluationRequest request) {
        return webClient.post()
                .uri("/api/trust/evaluate")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> response.bodyToMono(String.class)
                                .flatMap(
                                        body -> Mono.error(new RuntimeException("Trust Engine client error: " + body))))
                .onStatus(HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new RuntimeException("Trust Engine service unavailable")))
                .bodyToMono(TrustEvaluationResponse.class);
    }
}
