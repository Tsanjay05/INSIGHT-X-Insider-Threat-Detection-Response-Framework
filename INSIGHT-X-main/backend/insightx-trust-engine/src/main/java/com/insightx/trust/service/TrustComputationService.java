package com.insightx.trust.service;

import com.insightx.trust.algorithm.TrustComputationResult;
import com.insightx.trust.algorithm.TrustScoringEngine;
import com.insightx.trust.domain.*;
import com.insightx.trust.graph.TemporalGraphService;
import com.insightx.trust.hypothesis.IntentHypothesisService;
import com.insightx.trust.ingestion.EventNormalizationService;
import com.insightx.trust.repository.TrustStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Orchestrates the trust computation process:
 * Ingestion -> Normalization -> Risk Mapping -> Scoring -> Hypothesis -> Graph
 * -> Persistence.
 * 
 * <p>
 * Corresponds to Phase 3 Orchestration.
 */
@Service
public class TrustComputationService {

    private static final Logger logger = LoggerFactory.getLogger(TrustComputationService.class);

    private final EventNormalizationService normalizationService;
    private final TrustStateRepository trustStateRepository;
    private final TrustScoringEngine scoringEngine;
    private final IntentHypothesisService hypothesisService;
    private final TemporalGraphService graphService;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    public TrustComputationService(
            EventNormalizationService normalizationService,
            TrustStateRepository trustStateRepository,
            TrustScoringEngine scoringEngine,
            IntentHypothesisService hypothesisService,
            TemporalGraphService graphService,
            org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate) {
        this.normalizationService = normalizationService;
        this.trustStateRepository = trustStateRepository;
        this.scoringEngine = scoringEngine;
        this.hypothesisService = hypothesisService;
        this.graphService = graphService;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Processes a raw event and updates the trust state.
     * 
     * @param rawEvent The raw event.
     * @return Mono of the updated TrustState.
     */
    public Mono<TrustState> processEvent(RawEvent rawEvent) {
        Optional<TrustEvent> normalizedOpt = normalizationService.normalize(rawEvent);

        if (normalizedOpt.isEmpty()) {
            return Mono.empty();
        }

        TrustEvent event = normalizedOpt.get();
        String userId = event.userId();

        // Map event to risk indicators (Simple logic for now)
        List<RiskIndicator> indicators = mapToRiskIndicators(event);

        return trustStateRepository.findByEntityId(userId)
                .defaultIfEmpty(TrustState.initial(userId, Instant.now()))
                .flatMap(currentState -> {
                    // Update Graph
                    graphService.updateGraph(event);

                    // Compute new score
                    TrustComputationResult result = scoringEngine.compute(currentState.getCurrentTrustScore(),
                            indicators);

                    // Update Hypotheses
                    hypothesisService.updateHypotheses(userId, result.computedScore());

                    // Create new State
                    TrustState newState = new TrustState(
                            userId,
                            result.computedScore(),
                            Instant.now(),
                            currentState.getRollingHistorySummary() // In real app, update this too
                    );

                    // Create Decision Event
                    TrustDecision decision = new TrustDecision(
                            UUID.randomUUID().toString(),
                            userId,
                            result.computedScore(),
                            determineRiskLevel(result.computedScore()),
                            List.of(), // Policy flags to be populated by policy engine
                            List.of(TrustDelta.of(
                                    result.appliedDelta(),
                                    0.0,
                                    result.explanation().isEmpty() ? "Trust Update"
                                            : String.join(", ", result.explanation()),
                                    TrustSource.SIGNAL,
                                    Instant.now())),
                            Instant.now(),
                            newState);

                    // Emit to Kafka
                    kafkaTemplate.send("trust-decisions", userId, decision);

                    return trustStateRepository.save(newState);
                });
    }

    private RiskLevel determineRiskLevel(TrustScore score) {
        double val = score.getValue();
        if (val < 20)
            return RiskLevel.CRITICAL;
        if (val < 50)
            return RiskLevel.HIGH;
        if (val < 80)
            return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    private List<RiskIndicator> mapToRiskIndicators(TrustEvent event) {
        // Simple mapping logic for demonstration Phase 3
        double severity = 0.1;
        double contribution = 0.0;
        RiskIndicator.Type type = RiskIndicator.Type.BEHAVIORAL;

        if ("LOGIN_FAILURE".equals(event.eventType())) {
            severity = 0.5;
            contribution = -5.0;
            type = RiskIndicator.Type.BEHAVIORAL;
        } else if ("FILE_ACCESS_DENIED".equals(event.eventType())) {
            severity = 0.8;
            contribution = -10.0;
            type = RiskIndicator.Type.DATA_ACCESS;
        } else if ("LOGIN_SUCCESS".equals(event.eventType())) {
            severity = 0.1;
            contribution = 1.0; // Positive reinforcement
            type = RiskIndicator.Type.BEHAVIORAL;
        }

        if (contribution != 0.0) {
            return List.of(new RiskIndicator(
                    UUID.randomUUID().toString(),
                    type,
                    severity,
                    contribution,
                    "Event: " + event.eventType(),
                    event.sourceSystem()));
        }

        return Collections.emptyList();
    }
}
