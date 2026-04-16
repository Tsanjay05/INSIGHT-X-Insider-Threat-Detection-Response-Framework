package com.insightx.trust.policy;

import reactor.core.publisher.Mono;

/**
 * PolicyEvaluator is an explicit interface: policy is authoritative (OPA).
 *
 * <p>
 * Implementations may call OPA or a local bundle evaluator; Phase 1 allows a stub,
 * but the interface boundary is non-negotiable.
 */
public interface PolicyEvaluator {

    Mono<PolicyDecision> evaluate(PolicyEvaluationRequest request);
}

