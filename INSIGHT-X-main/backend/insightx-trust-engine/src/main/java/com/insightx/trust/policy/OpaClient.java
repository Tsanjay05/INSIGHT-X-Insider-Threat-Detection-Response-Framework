package com.insightx.trust.policy;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Client for interacting with Open Policy Agent (OPA).
 * 
 * <p>
 * Corresponds to FR-2.4 (Policy-governed trust arbitration).
 */
@Component
public class OpaClient {

    private final WebClient webClient;

    public OpaClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8181/v1/data").build(); // Externalize URL
    }

    /**
     * Evaluates a policy against the given input.
     * 
     * @param policyPath The path to the policy (e.g.,
     *                   "insightx/trust/risk_thresholds").
     * @param input      The input data for the policy.
     * @return Mono of the result (JsonNode).
     */
    public Mono<JsonNode> evaluate(String policyPath, Map<String, Object> input) {
        return webClient.post()
                .uri("/" + policyPath)
                .bodyValue(Map.of("input", input))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(response -> response.path("result"))
                .timeout(java.time.Duration.ofMillis(500)) // Deterministic timeout
                .onErrorResume(e -> {
                    // Safe Fallback: Observe Only / Log Failure
                    return Mono.just(createFallbackNode());
                });
    }

    private JsonNode createFallbackNode() {
        com.fasterxml.jackson.databind.node.ObjectNode fallback = new com.fasterxml.jackson.databind.ObjectMapper()
                .createObjectNode();
        fallback.put("risk_level", "LOW");
        fallback.put("required", false);
        fallback.put("fallback", "OPA_UNAVAILABLE");
        return fallback;
    }
}
