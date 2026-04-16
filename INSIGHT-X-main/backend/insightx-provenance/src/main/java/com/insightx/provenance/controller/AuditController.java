package com.insightx.provenance.controller;

import com.insightx.provenance.domain.AuditLog;
import com.insightx.provenance.service.AuditService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono; // Import Mono

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    @GetMapping
    public Flux<AuditLog> getLogs(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String resource,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {
        return service.getAuditLogs(actor, resource, start, end);
    }

    @PostMapping("/log") // Internal use or manual trigger
    public Mono<AuditLog> createLog(@RequestBody Map<String, Object> payload) {
        return service.logAction(
                (String) payload.get("actor"),
                (String) payload.get("action"),
                (String) payload.get("resource"),
                (String) payload.get("resourceId"),
                (String) payload.get("details"),
                (String) payload.get("status"),
                (String) payload.get("ipAddress"),
                (Map<String, Object>) payload.get("metadata"));
    }
}
