package insightx.trust.decay

import future.keywords.if
import future.keywords.in

# Trust decay policy - reduces trust score based on inactivity and time

default allow_access = false
default requires_step_up_auth = false
default trust_decay_applied = false

# Trust score thresholds
CRITICAL_TRUST_THRESHOLD := 0.3
MONITORING_TRUST_THRESHOLD := 0.5
DECAY_RATE_PER_HOUR := 0.001
MAX_INACTIVE_HOURS := 168  # 7 days

# Main policy decision
allow_access if {
    input.trust_score >= CRITICAL_TRUST_THRESHOLD
    not exceeds_max_inactivity
}

requires_step_up_auth if {
    input.trust_score < MONITORING_TRUST_THRESHOLD
    input.trust_score >= CRITICAL_TRUST_THRESHOLD
}

# Calculate trust decay based on inactivity
trust_decay := decay_amount if {
    inactive_hours := time_since_last_activity_hours
    decay_amount := inactive_hours * DECAY_RATE_PER_HOUR
}

adjusted_trust_score := score if {
    current_score := input.trust_score
    decay := trust_decay
    score := max(current_score - decay, 0.0)
}

# Check if user exceeds maximum allowed inactivity
exceeds_max_inactivity if {
    inactive_hours := time_since_last_activity_hours
    inactive_hours > MAX_INACTIVE_HOURS
}

# Calculate hours since last activity
time_since_last_activity_hours := hours if {
    current_time := time.now_ns()
    last_activity := time.parse_rfc3339_ns(input.last_activity_timestamp)
    diff_ns := current_time - last_activity
    hours := diff_ns / 3600000000000  # Convert to hours
}

# Decay actions based on trust level
decay_action := action if {
    adjusted_trust_score < CRITICAL_TRUST_THRESHOLD
    action := {
        "action": "BLOCK_ACCESS",
        "reason": "Trust score below critical threshold after decay",
        "requires_revalidation": true,
        "adjusted_trust_score": adjusted_trust_score
    }
} else := action if {
    adjusted_trust_score < MONITORING_TRUST_THRESHOLD
    action := {
        "action": "REQUIRE_MFA",
        "reason": "Trust score below monitoring threshold after decay",
        "requires_revalidation": false,
        "adjusted_trust_score": adjusted_trust_score
    }
} else := action if {
    action := {
        "action": "ALLOW",
        "reason": "Trust score acceptable",
        "requires_revalidation": false,
        "adjusted_trust_score": adjusted_trust_score
    }
}

# Helper function for max
max(a, b) = result if {
    a > b
    result := a
} else = b
