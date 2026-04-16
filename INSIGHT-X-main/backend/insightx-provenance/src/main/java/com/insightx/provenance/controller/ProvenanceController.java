package com.insightx.provenance.controller;

import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.provenance.service.ExplanationService;
import com.insightx.provenance.service.ForensicReconstructionService;
import com.insightx.provenance.repository.ProvenanceRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/provenance")
public class ProvenanceController {

    private final ProvenanceRepository repository;
    private final ExplanationService explanationService;
    private final ForensicReconstructionService forensicsService;

    public ProvenanceController(ProvenanceRepository repository,
            ExplanationService explanationService,
            ForensicReconstructionService forensicsService) {
        this.repository = repository;
        this.explanationService = explanationService;
        this.forensicsService = forensicsService;
    }

    @GetMapping("/decision/{id}")
    public Mono<DecisionProvenance> getDecision(@PathVariable String id) {
        return repository.findByDecisionId(id);
    }

    // Alias for frontend compatibility
    @GetMapping("/decisions/{id}")
    public Mono<DecisionProvenance> getDecisionById(@PathVariable String id) {
        return repository.findByDecisionId(id);
    }

    @GetMapping("/decisions")
    public Flux<DecisionProvenance> getDecisions(
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
        Flux<DecisionProvenance> source = entityId != null && !entityId.isBlank()
                ? repository.findByEntityId(entityId)
                : repository.findAll();

        if (riskLevel != null && !riskLevel.isBlank()) {
            source = source.filter(record -> riskLevel.equalsIgnoreCase(record.riskLevel()));
        }
        if (startTime != null) {
            source = source.filter(record -> !record.decisionTimestamp().isBefore(startTime));
        }
        if (endTime != null) {
            source = source.filter(record -> !record.decisionTimestamp().isAfter(endTime));
        }

        return source;
    }

    @GetMapping("/explain/decision/{id}")
    public Mono<Map<String, Object>> explainDecision(@PathVariable String id) {
        return explanationService.generateExplanation(id);
    }

    @GetMapping("/timeline/{entityId}")
    public Flux<DecisionProvenance> getEntityTimeline(@PathVariable String entityId) {
        return forensicsService.getTimelineForEntity(entityId);
    }

    // Alias for frontend compatibility
    @GetMapping("/forensic/{entityId}")
    public Flux<DecisionProvenance> getForensicTimeline(@PathVariable String entityId) {
        return forensicsService.getTimelineForEntity(entityId);
    }
}
