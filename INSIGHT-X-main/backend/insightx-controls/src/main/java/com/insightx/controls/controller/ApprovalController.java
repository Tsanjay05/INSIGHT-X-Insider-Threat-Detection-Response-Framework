package com.insightx.controls.controller;

import com.insightx.controls.domain.ApprovalRequest;
import com.insightx.controls.service.ApprovalService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/controls/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @PostMapping("/{approvalId}/approve")
    public Mono<ApprovalRequest> approve(@PathVariable String approvalId, @RequestParam String resolverId) {
        return approvalService.resolveRequest(approvalId, true, resolverId);
    }

    @PostMapping("/{approvalId}/deny")
    public Mono<ApprovalRequest> deny(@PathVariable String approvalId, @RequestParam String resolverId) {
        return approvalService.resolveRequest(approvalId, false, resolverId);
    }
}
