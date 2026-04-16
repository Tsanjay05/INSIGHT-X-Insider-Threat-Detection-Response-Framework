package com.insightx.controls.repository;

import com.insightx.controls.domain.ApprovalRequest;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalRequestRepository extends R2dbcRepository<ApprovalRequest, String> {
}
