package com.insightx.trust.service;

import com.insightx.trust.api.EvaluateTrustRequest;
import com.insightx.trust.api.NormalizedSignal;
import com.insightx.trust.domain.*;
import com.insightx.trust.persistence.ProvenanceRepository;
import com.insightx.trust.persistence.TrustDecisionRepository;
import com.insightx.trust.persistence.TrustStateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Trust State Evolution Orchestrator (Phase 3).
 * <p>
 * Replaces legacy TrustEvaluationService logic with:
 * 1. Temporal Decay
 * 2. Signal Impact
 * 3. Policy Arbitration
 * 4. Immutable History Update
 */
@Service
public class TrustEvaluationService {

        private final TrustStateRepository trustStateRepository;
        private final TrustDecisionRepository trustDecisionRepository;
        private final ProvenanceRepository provenanceRepository;
        private final TemporalTrustDecayEngine decayEngine;
        private final SignalTrustImpactEngine signalEngine;
        private final PolicyArbitrationService policyService;
        private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

        public TrustEvaluationService(
                        TrustStateRepository trustStateRepository,
                        TrustDecisionRepository trustDecisionRepository,
                        ProvenanceRepository provenanceRepository,
                        TemporalTrustDecayEngine decayEngine,
                        SignalTrustImpactEngine signalEngine,
                        PolicyArbitrationService policyService,
                        org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate) {
                this.trustStateRepository = trustStateRepository;
                this.trustDecisionRepository = trustDecisionRepository;
                this.provenanceRepository = provenanceRepository;
                this.decayEngine = decayEngine;
                this.signalEngine = signalEngine;
                this.policyService = policyService;
                this.kafkaTemplate = kafkaTemplate;
        }

        /**
         * Evaluates trust based on request.
         */
        @Transactional
        public Mono<TrustDecision> evaluate(EvaluateTrustRequest request) {
                String entityId = request.entityId();
                Instant now = request.evaluationTimestamp();
                List<NormalizedSignal> signals = request.normalizedSignals();

                return trustStateRepository.findByEntityId(entityId)
                                .defaultIfEmpty(TrustState.initial(entityId, now))
                                .flatMap(currentState -> processEvaluation(currentState, signals, now));
        }

        @Transactional(readOnly = true)
        public Mono<TrustState> getTrustState(String entityId) {
                return trustStateRepository.findByEntityId(entityId);
        }

        /**
         * Get trust decision history for an entity
         * 
         * @param entityId Entity ID to query
         * @param limit    Maximum number of decisions to return
         * @return Flux of historical trust decisions, newest first
         */
        @Transactional(readOnly = true)
        public reactor.core.publisher.Flux<TrustDecision> getTrustHistory(String entityId, int limit) {
                return trustDecisionRepository.findByEntityIdOrderByTimestampDesc(entityId)
                                .take(limit);
        }

        private Mono<TrustDecision> processEvaluation(TrustState currentState, List<NormalizedSignal> signals,
                        Instant now) {
                // 1. Compute Decay
                TrustDelta decayDelta = decayEngine.computeDecay(currentState.getCurrentTrustScore(),
                                currentState.getLastUpdated(), now);

                // Calculate decayed score for provenance
                double decayedScoreVal = TrustInvariants.clampScore(
                                currentState.getCurrentTrustScore().getValue() + decayDelta.getTrustDelta());
                double decayedConfVal = TrustInvariants.clampConfidence(
                                currentState.getCurrentTrustScore().getConfidence() + decayDelta.getConfidenceDelta());
                TrustScore decayedScore = new TrustScore(decayedScoreVal, decayedConfVal);

                // 2. Compute Signal Impacts
                List<TrustDelta> signalDeltas = signals.stream()
                                .map(signalEngine::computeImpact)
                                .toList();

                // 3. Aggregate Deltas
                List<TrustDelta> allDeltas = new ArrayList<>();
                allDeltas.add(decayDelta);
                allDeltas.addAll(signalDeltas);

                double newScoreVal = currentState.getCurrentTrustScore().getValue();
                double newConfVal = currentState.getCurrentTrustScore().getConfidence();

                for (TrustDelta delta : allDeltas) {
                        newScoreVal += delta.getTrustDelta();
                        newConfVal += delta.getConfidenceDelta();
                }

                // Clamp
                newScoreVal = TrustInvariants.clampScore(newScoreVal);
                newConfVal = TrustInvariants.clampConfidence(newConfVal);
                TrustScore prePolicyScore = new TrustScore(newScoreVal, newConfVal);

                // 4. Policy Arbitration
                PolicyArbitrationService.PolicyResult policyResult = policyService.evaluate(prePolicyScore);

                List<String> flags = policyResult.flags() != null ? policyResult.flags() : List.of();

                // 5. Update History
                RollingHistorySummary newHistory = currentState.getRollingHistorySummary().next(
                                now,
                                prePolicyScore.getValue(),
                                "Risk: " + policyResult.riskLevel());

                // 6. Create New State
                TrustState newState = new TrustState(currentState.getEntityId(), prePolicyScore, now, newHistory);

                // 7. Assemble Decision
                String decisionId = UUID.randomUUID().toString();

                TrustDecision decision = new TrustDecision(
                                decisionId,
                                currentState.getEntityId(),
                                prePolicyScore,
                                policyResult.riskLevel(),
                                flags,
                                allDeltas,
                                now,
                                newState);

                // Convert signals to indicators for provenance
                List<RiskIndicator> indicators = signals.stream()
                                .map(s -> new RiskIndicator(s.id(), s.type(), s.severity(), s.contribution(),
                                                s.description(), s.source()))
                                .toList();

                // 8. Create Provenance Record
                ProvenanceRecord provenance = new ProvenanceRecord(
                                decisionId,
                                currentState.getEntityId(),
                                new ProvenanceRecord.Inputs(
                                                now,
                                                currentState.getCurrentTrustScore(),
                                                currentState.getLastUpdated(),
                                                currentState.getRollingHistorySummary(),
                                                decayedScore,
                                                decision.getExplanation()),
                                indicators,
                                new ProvenanceRecord.PolicyOutput(
                                                policyResult.riskLevel(),
                                                decision.isHumanInLoopRequired(),
                                                flags.contains("allowAccess"),
                                                flags.contains("requireStepUpAuth"),
                                                flags.contains("requireSecurityReview"),
                                                flags.contains("requireCaseCreation"),
                                                Collections.emptyList() // Policy reasons
                                ),
                                new ProvenanceRecord.Timestamps(now, now),
                                Collections.emptyList() // Policy References
                );

                // 9. Persist
                return trustStateRepository.upsert(newState)
                                .then(trustDecisionRepository.append(decision))
                                .then(provenanceRepository.append(provenance))
                                .doOnSuccess(v -> {
                                        try {
                                                kafkaTemplate.send("trust-decisions", decision.getEntityId(), decision);
                                        } catch (Exception e) {
                                                // Log error but generally safe
                                        }
                                })
                                .thenReturn(decision);
        }
}
