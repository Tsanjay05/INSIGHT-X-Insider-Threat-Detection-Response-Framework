package com.insightx.provenance.service;

import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.provenance.repository.ProvenanceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class ExplanationService {

    private final ProvenanceRepository repository;

    public ExplanationService(ProvenanceRepository repository) {
        this.repository = repository;
    }

    public Mono<Map<String, Object>> generateExplanation(String decisionId) {
        return repository.findByDecisionId(decisionId)
                .map(this::constructExplanationBundle)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Decision not found: " + decisionId)));
    }

    private Map<String, Object> constructExplanationBundle(DecisionProvenance provenance) {
        Map<String, Object> bundle = new HashMap<>();

        // 1. Summary
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Trust Score of %.2f (Risk: %s) was calculated for entity %s.",
                provenance.trustScore(), provenance.riskLevel(), provenance.entityId()));

        switch (provenance.riskLevel()) {
            case "CRITICAL":
                sb.append(" Immediate investigation required.");
                break;
            case "HIGH":
                sb.append(" Recommend restrictive policies.");
                break;
            case "MEDIUM":
                sb.append(" Monitor closely.");
                break;
            case "LOW":
                sb.append(" Standard access permitted.");
                break;
        }

        if (provenance.policyFallback()) {
            sb.append(" WARNING: Policy Engine was unavailable; Fallback logic was used.");
        }
        bundle.put("summary", sb.toString());

        // 2. Policy Trace
        Map<String, Object> trace = new HashMap<>();
        trace.put("policyId", provenance.policyId());
        trace.put("policyVersion", provenance.policyVersion());
        trace.put("policyHash", provenance.policyHash());
        // In real impl, fetch rule details from Policy Service using ID/Version
        bundle.put("policyTrace", trace);

        // 3. Confidence
        bundle.put("confidence",
                String.format("%.2f%% confidence based on available signals.", provenance.confidence() * 100));

        // 4. Meta
        bundle.put("timestamp", provenance.decisionTimestamp());
        bundle.put("isSimulation", provenance.isSimulation());

        return bundle;
    }
}
