package com.insightx.trust.policy;

import java.util.Map;
import java.util.Objects;

/**
 * Policy flags / obligations returned by the policy engine.
 *
 * <p>
 * These are not enforcement actions; they are eligibility / requirements that downstream
 * control systems may use.
 */
public record PolicyFlags(
        boolean allowAccess,
        boolean requireStepUpAuth,
        boolean requireSecurityReview,
        boolean requireCaseCreation,
        Map<String, Boolean> additionalFlags
) {
    public PolicyFlags {
        additionalFlags = additionalFlags == null ? Map.of() : Map.copyOf(additionalFlags);
        Objects.requireNonNull(additionalFlags, "additionalFlags must not be null");
    }
}

