package com.insightx.trust.hypothesis;

import com.insightx.trust.domain.TrustScore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service to manage and evaluate intent hypotheses.
 * 
 * <p>
 * Corresponds to FR-3.1 and FR-3.2.
 */
@Service
public class IntentHypothesisService {

    // In-memory storage for now
    private final Map<String, List<IntentHypothesis>> userHypotheses = new ConcurrentHashMap<>();

    /**
     * Updates hypotheses for a user based on the latest trust score and events.
     * 
     * @param userId       The user ID.
     * @param currentScore The current trust score.
     * @return List of active hypotheses.
     */
    public List<IntentHypothesis> updateHypotheses(String userId, TrustScore currentScore) {
        List<IntentHypothesis> hypotheses = userHypotheses.getOrDefault(userId, new ArrayList<>());

        // Simple logic: If score drops below threshold, generate/update MALICIOUS
        // hypothesis
        if (currentScore.getValue() < 30.0) {
            updateOrAddHypothesis(hypotheses, userId, HypothesisType.MALICIOUS_INSIDER, 0.8,
                    "Trust score critically low: " + currentScore.getValue());
        } else if (currentScore.getValue() < 60.0) {
            updateOrAddHypothesis(hypotheses, userId, HypothesisType.NEGLIGENT_MISUSE, 0.6,
                    "Trust score degraded: " + currentScore.getValue());
        } else {
            updateOrAddHypothesis(hypotheses, userId, HypothesisType.BENIGN_ROLE_EXPANSION, 0.9,
                    "Trust score healthy: " + currentScore.getValue());
        }

        userHypotheses.put(userId, hypotheses);
        return hypotheses;
    }

    public List<IntentHypothesis> getHypotheses(String userId) {
        return userHypotheses.getOrDefault(userId, List.of());
    }

    private void updateOrAddHypothesis(List<IntentHypothesis> hypotheses, String userId, HypothesisType type,
            double confidence, String evidence) {
        // Remove existing of same type to replace
        hypotheses.removeIf(h -> h.type() == type);
        hypotheses.add(new IntentHypothesis(userId, type, confidence, evidence));
    }
}
