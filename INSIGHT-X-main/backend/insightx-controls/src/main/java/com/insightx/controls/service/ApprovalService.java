package com.insightx.controls.service;

import com.insightx.controls.domain.ApprovalRequest;
import com.insightx.controls.domain.ApprovalRequest.ApprovalOutcome;
import com.insightx.controls.domain.ApprovalRequest.ApprovalRole;
import com.insightx.controls.domain.ApprovalRequest.ApprovalStatus;
import com.insightx.controls.repository.ApprovalRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class ApprovalService {

    private final ApprovalRequestRepository repository;

    public ApprovalService(ApprovalRequestRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Mono<ApprovalRequest> requestApproval(String entityId, String action, String reason, String policyRef,
            ApprovalRole role) {
        ApprovalRequest request = new ApprovalRequest(
                UUID.randomUUID().toString(),
                entityId,
                action,
                reason,
                policyRef,
                ApprovalStatus.PENDING,
                Instant.now(),
                null,
                null,
                role,
                null,
                Instant.now().plus(24, ChronoUnit.HOURS) // 24h Expiry
        );
        return repository.save(request);
    }

    @Transactional
    public Mono<ApprovalRequest> resolveRequest(String approvalId, boolean approved, String resolverId) {
        return repository.findById(approvalId)
                .flatMap(request -> {
                    if (request.status() != ApprovalStatus.PENDING) {
                        return Mono.error(new IllegalStateException("Request is not PENDING"));
                    }
                    ApprovalRequest resolved = new ApprovalRequest(
                            request.approvalId(),
                            request.entityId(),
                            request.requestedAction(),
                            request.reason(),
                            request.policyReference(),
                            approved ? ApprovalStatus.APPROVED : ApprovalStatus.DENIED,
                            request.requestedAt(),
                            Instant.now(),
                            resolverId,
                            request.approvalRole(),
                            approved ? ApprovalOutcome.APPROVED : ApprovalOutcome.DENIED,
                            request.expiresAt());
                    return repository.save(resolved);
                });
    }
}
