package com.insightx.gateway.controller;

import com.insightx.gateway.api.TrustEvaluationRequest;
import com.insightx.gateway.api.TrustEvaluationResponse;
import com.insightx.gateway.client.TrustEngineClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/trust")
public class TrustGatewayController {

    private final TrustEngineClient trustEngineClient;

    public TrustGatewayController(TrustEngineClient trustEngineClient) {
        this.trustEngineClient = trustEngineClient;
    }

    @PostMapping("/evaluate")
    public Mono<TrustEvaluationResponse> evaluate(@RequestBody TrustEvaluationRequest request) {
        return trustEngineClient.evaluateTrust(request);
    }
}
