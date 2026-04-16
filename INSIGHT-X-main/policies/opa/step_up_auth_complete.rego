package insightx.auth.stepup

import future.keywords.if
import future.keywords.in

# Step-up authentication policy - requires additional verification for sensitive operations

default requires_step_up = false
default mfa_methods_allowed = []

# Operations requiring step-up authentication
SENSITIVE_OPERATIONS := [
    "deploy_policy",
    "execute_control",
    "terminate_user",
    "access_critical_data",
    "modify_security_settings",
    "approve_high_risk_action"
]

# Trust score threshold for step-up
STEP_UP_TRUST_THRESHOLD := 0.7

# Main step-up requirement
requires_step_up if {
    is_sensitive_operation
}

requires_step_up if {
    low_trust_score
}

requires_step_up if {
    recent_risk_indicator
}

requires_step_up if {
    accessing_critical_resource
}

# Check if operation is sensitive
is_sensitive_operation if {
    input.operation in SENSITIVE_OPERATIONS
}

# Check if trust score is low
low_trust_score if {
    input.user.trust_score < STEP_UP_TRUST_THRESHOLD
}

# Check for recent risk indicators
recent_risk_indicator if {
    count(input.recent_risk_indicators) > 0
}

# Check if accessing critical resource
accessing_critical_resource if {
    input.resource.classification == "CRITICAL"
}

# Determine allowed MFA methods based on context
mfa_methods_allowed := methods if {
    input.user.trust_score > 0.8
    methods := ["totp", "push", "webauthn"]
} else := methods if {
    input.user.trust_score > 0.6
    methods := ["webauthn", "totp"]
} else := ["webauthn"]  # Only hardware key for low trust

# Cache step-up authentication
cache_duration_seconds := duration if {
    input.user.trust_score > 0.8
    duration := 300  # 5 minutes for high trust
} else := duration if {
    input.user.trust_score > 0.6
    duration := 120  # 2 minutes for medium trust
} else := 60  # 1 minute for low trust

# Step-up decision
decision := result if {
    result := {
        "requires_step_up": requires_step_up,
        "mfa_methods_allowed": mfa_methods_allowed,
        "cache_duration_seconds": cache_duration_seconds,
        "reason": step_up_reason
    }
}

# Reason for step-up requirement
step_up_reason := reason if {
    is_sensitive_operation
    reason := sprintf("Sensitive operation: %s", [input.operation])
} else := reason if {
    low_trust_score
    reason := sprintf("Low trust score: %.2f", [input.user.trust_score])
} else := reason if {
    recent_risk_indicator
    reason := "Recent risk indicators detected"
} else := reason if {
    accessing_critical_resource
    reason := "Accessing critical resource"
} else := "Step-up not required"
