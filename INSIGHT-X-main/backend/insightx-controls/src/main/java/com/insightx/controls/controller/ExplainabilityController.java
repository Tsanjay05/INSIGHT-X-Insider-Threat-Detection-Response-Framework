package com.insightx.controls.controller;

import com.insightx.controls.domain.AdaptiveControl;
import com.insightx.controls.domain.AdaptiveControl.ControlStatus;
import com.insightx.controls.repository.AdaptiveControlRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/controls/explain")
public class ExplainabilityController {

    private final AdaptiveControlRepository repository;

    public ExplainabilityController(AdaptiveControlRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/active/{entityId}")
    public Flux<AdaptiveControl> getActiveControls(@PathVariable String entityId) {
        return repository.findByEntityIdAndStatus(entityId, ControlStatus.ACTIVE);
    }

    // Future: Get history, link to decision IDs, etc.
}
