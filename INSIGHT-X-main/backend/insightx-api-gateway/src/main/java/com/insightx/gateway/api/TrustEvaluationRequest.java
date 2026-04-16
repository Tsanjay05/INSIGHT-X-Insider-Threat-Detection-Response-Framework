package com.insightx.gateway.api;

import java.time.Instant;
import java.util.List;

public record TrustEvaluationRequest(
                String entityId,
                List<NormalizedSignal> normalizedSignals,
                Instant evaluationTimestamp) {

        public TrustEvaluationRequest(String entityId, List<NormalizedSignal> normalizedSignals,
                        Instant evaluationTimestamp) {
                this.entityId = entityId;
                this.normalizedSignals = normalizedSignals == null ? List.of() : List.copyOf(normalizedSignals);
                this.evaluationTimestamp = evaluationTimestamp == null ? Instant.now() : evaluationTimestamp;
        }
}
