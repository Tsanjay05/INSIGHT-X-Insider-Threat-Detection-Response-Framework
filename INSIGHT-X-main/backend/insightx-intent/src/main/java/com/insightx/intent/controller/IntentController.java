package com.insightx.intent.controller;

import com.insightx.intent.domain.IntentHypothesis;
import com.insightx.intent.service.HypothesisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/intent")
public class IntentController {

    private final HypothesisService hypothesisService;

    public IntentController(HypothesisService hypothesisService) {
        this.hypothesisService = hypothesisService;
    }

    @GetMapping("/active/{entityId}")
    public Flux<IntentHypothesis> getActiveHypotheses(@PathVariable String entityId) {
        return hypothesisService.getHypotheses(entityId);
    }
}
