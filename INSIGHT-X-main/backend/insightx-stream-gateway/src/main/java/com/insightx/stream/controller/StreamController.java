package com.insightx.stream.controller;

import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.trust.domain.TrustDecision;
import com.insightx.stream.service.StreamService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/stream")
public class StreamController {

        private final StreamService streamService;

        public StreamController(StreamService streamService) {
                this.streamService = streamService;
        }

        @GetMapping(value = "/trust-decisions", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<TrustDecision>> streamTrustDecisions() {
                return streamService.getTrustDecisionStream()
                                .map(decision -> ServerSentEvent.builder(decision)
                                                .id(decision.decisionId())
                                                .event("trust-decision")
                                                .build());
        }

        @GetMapping(value = "/controls", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<AdaptiveControl>> streamControls() {
                return streamService.getControlsStream()
                                .map(control -> ServerSentEvent.builder(control)
                                                .id(control.controlId())
                                                .event("control-update")
                                                .build());
        }

        @GetMapping(value = "/provenance", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<DecisionProvenance>> streamProvenance() {
                return streamService.getProvenanceStream()
                                .map(provenance -> ServerSentEvent.builder(provenance)
                                                .id(provenance.decisionId())
                                                .event("provenance-record")
                                                .build());
        }
}
