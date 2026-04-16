# INSIGHT-X OPA Policy: Trust Decay Rules (FR-2.4, FR-2.5)
# Policy-governed trust arbitration

package insightx.trust

# Default trust decay rate (configurable)
default decay_rate := 0.01

# Trust decay when no activity for N hours
trust_decay[result] {
    inactive_hours := input.inactive_hours
    inactive_hours > 24
    result := {
        "action": "decay",
        "rate": decay_rate * (inactive_hours / 24),
        "reason": "inactivity"
    }
}

# Trust threshold for heightened monitoring
heightened_monitoring[result] {
    input.trust_score < 0.7
    result := {
        "action": "heightened_monitoring",
        "threshold": 0.7,
        "reason": "trust_below_threshold"
    }
}

# Trust threshold for step-up authentication
step_up_auth[result] {
    input.trust_score < 0.5
    result := {
        "action": "step_up_auth",
        "threshold": 0.5,
        "reason": "trust_critical"
    }
}
