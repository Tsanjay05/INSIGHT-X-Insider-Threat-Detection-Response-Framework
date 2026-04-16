package com.insightx.trust.controller;

import com.insightx.trust.api.EvaluateTrustRequest;
import com.insightx.trust.api.EvaluateTrustResponse;
import com.insightx.trust.service.TrustEvaluationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller exposing trust evaluation APIs.
 */
@RestController
@RequestMapping("/api/trust")
public class TrustController {

        private final TrustEvaluationService trustEvaluationService;

        public TrustController(TrustEvaluationService trustEvaluationService) {
                this.trustEvaluationService = trustEvaluationService;
        }

        @PostMapping("/evaluate")
        public Mono<EvaluateTrustResponse> evaluate(@RequestBody EvaluateTrustRequest request) {
                return trustEvaluationService.evaluate(request)
                                .map(decision -> {
                                        // Convert List<String> flags to Map<String, Boolean> (all true)
                                        Map<String, Boolean> flagsMap = new HashMap<>();
                                        if (decision.getAppliedPolicies() != null) {
                                                decision.getAppliedPolicies().forEach(f -> flagsMap.put(f, true));
                                        }

                                        return new EvaluateTrustResponse(
                                                        decision.getDecisionId(),
                                                        decision.getEntityId(),
                                                        decision.getFinalTrustScore().getValue(),
                                                        decision.getFinalTrustScore().getConfidence(),
                                                        decision.getRiskLevel().name(),
                                                        flagsMap,
                                                        decision.isHumanInLoopRequired(),
                                                        decision.getExplanation());
                                });
        }

        @org.springframework.web.bind.annotation.GetMapping("/users/{id}")
        public Mono<TrustStateResponse> getTrustState(@org.springframework.web.bind.annotation.PathVariable String id) {
                return trustEvaluationService.getTrustState(id)
                                .switchIfEmpty(Mono.error(
                                                new org.springframework.web.server.ResponseStatusException(
                                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                                "Trust state not found for entity: " + id)))
                                .map(state -> new TrustStateResponse(
                                                state.getEntityId(),
                                                state.getCurrentTrustScore().getValue(),
                                                state.getCurrentTrustScore().getConfidence(),
                                                state.getLastUpdated()));
        }

        /**
         * Get trust decision history for a user
         * 
         * @param id    User entity ID
         * @param limit Maximum number of historical decisions to return (default: 20)
         * @return Flux of historical trust decisions
         */
        @org.springframework.web.bind.annotation.GetMapping("/users/{id}/history")
        public reactor.core.publisher.Flux<TrustHistoryEntry> getTrustHistory(
                        @org.springframework.web.bind.annotation.PathVariable String id,
                        @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") int limit) {
                return trustEvaluationService.getTrustHistory(id, limit)
                                .map(decision -> new TrustHistoryEntry(
                                                decision.getDecisionId(),
                                                decision.getEntityId(),
                                                decision.getFinalTrustScore().getValue(),
                                                decision.getFinalTrustScore().getConfidence(),
                                                decision.getRiskLevel().name(),
                                                decision.decidedAt()));
        }

        public record TrustStateResponse(
                        String entityId,
                        double trustScore,
                        double confidence,
                        java.time.Instant lastUpdated) {
        }

        public record TrustHistoryEntry(
                        String decisionId,
                        String entityId,
                        double trustScore,
                        double confidence,
                        String riskLevel,
                        java.time.Instant timestamp) {
        }
}
