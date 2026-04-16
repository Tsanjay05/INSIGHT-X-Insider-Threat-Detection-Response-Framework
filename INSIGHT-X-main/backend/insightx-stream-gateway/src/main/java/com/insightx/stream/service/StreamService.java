package com.insightx.stream.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.trust.domain.TrustDecision;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class StreamService {
    private static final Logger logger = LoggerFactory.getLogger(StreamService.class);

    private final Sinks.Many<TrustDecision> trustDecisionSink;
    private final Sinks.Many<AdaptiveControl> controlsSink;
    private final Sinks.Many<DecisionProvenance> provenanceSink;
    private final ObjectMapper objectMapper;

    public StreamService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        // Replay last 1 for immediate state on connection
        this.trustDecisionSink = Sinks.many().replay().latest();
        this.controlsSink = Sinks.many().replay().latest();
        this.provenanceSink = Sinks.many().multicast().onBackpressureBuffer();
    }

    // --- Trust Decisions ---
    @KafkaListener(topics = "trust-decisions", groupId = "insightx-stream-gateway-trust")
    public void consumeTrustDecision(String message) {
        try {
            TrustDecision event = objectMapper.readValue(message, TrustDecision.class);
            logger.debug("Received TrustDecision: {}", event.decisionId());
            trustDecisionSink.tryEmitNext(event);
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize TrustDecision: {}", message, e);
        }
    }

    public Flux<TrustDecision> getTrustDecisionStream() {
        return trustDecisionSink.asFlux();
    }

    // --- Controls ---
    @KafkaListener(topics = "control-events", groupId = "insightx-stream-gateway-controls")
    public void consumeControlEvent(String message) {
        try {
            AdaptiveControl event = objectMapper.readValue(message, AdaptiveControl.class);
            logger.debug("Received Control Event: {}", event.controlId());
            controlsSink.tryEmitNext(event);
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize AdaptiveControl: {}", message, e);
        }
    }

    public Flux<AdaptiveControl> getControlsStream() {
        return controlsSink.asFlux();
    }

    // --- Provenance ---
    @KafkaListener(topics = "decision-provenance-events", groupId = "insightx-stream-gateway-provenance")
    public void consumeProvenanceEvent(String message) {
        try {
            DecisionProvenance event = objectMapper.readValue(message, DecisionProvenance.class);
            logger.debug("Received Provenance Event: {}", event.decisionId());
            provenanceSink.tryEmitNext(event);
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize DecisionProvenance: {}", message, e);
        }
    }

    public Flux<DecisionProvenance> getProvenanceStream() {
        return provenanceSink.asFlux();
    }
}
