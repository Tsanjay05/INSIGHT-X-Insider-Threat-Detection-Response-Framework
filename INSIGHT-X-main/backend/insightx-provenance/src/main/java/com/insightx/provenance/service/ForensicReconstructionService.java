package com.insightx.provenance.service;

import com.insightx.provenance.domain.DecisionProvenance;
import com.insightx.provenance.repository.ProvenanceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class ForensicReconstructionService {

    private final ProvenanceRepository repository;

    public ForensicReconstructionService(ProvenanceRepository repository) {
        this.repository = repository;
    }

    public Flux<DecisionProvenance> getTimelineForEntity(String entityId) {
        // In a real implementation, this would join with signals, controls, etc.
        // For now, it returns the stream of decisions ordered by time.
        return repository.findAll() // TODO: Add findByEntityId in Repo
                .filter(p -> p.entityId().equals(entityId))
                .sort((p1, p2) -> p1.decisionTimestamp().compareTo(p2.decisionTimestamp()));
    }
}
