package insightx.risk.thresholds

import future.keywords.if
import future.keywords.in

# Risk threshold policy - evaluates cumulative risk indicators

default risk_level = "low"
default block_access = false
default requires_approval = false

# Risk scoring weights
WEIGHT_BEHAVIORAL_ANOMALY := 0.3
WEIGHT_TRUST_SCORE_DECLINE := 0.25
WEIGHT_PRIVILEGED_ACCESS := 0.2
WEIGHT_DATA_EXFILTRATION := 0.15
WEIGHT_POLICY_VIOLATIONS := 0.1

# Risk thresholds
CRITICAL_RISK_THRESHOLD := 0.8
HIGH_RISK_THRESHOLD := 0.6
MEDIUM_RISK_THRESHOLD := 0.4

# Calculate composite risk score
composite_risk_score := score if {
    behavioral_score := count_risk_indicators("behavioral_anomaly") * WEIGHT_BEHAVIORAL_ANOMALY
    trust_decline_score := trust_score_change * WEIGHT_TRUST_SCORE_DECLINE
    privileged_score := count_risk_indicators("privileged_access") * WEIGHT_PRIVILEGED_ACCESS
    exfiltration_score := count_risk_indicators("data_exfiltration") * WEIGHT_DATA_EXFILTRATION
    violation_score := count_risk_indicators("policy_violation") * WEIGHT_POLICY_VIOLATIONS
    
    score := min(behavioral_score + trust_decline_score + privileged_score + exfiltration_score + violation_score, 1.0)
}

# Determine risk level
risk_level := level if {
    composite_risk_score >= CRITICAL_RISK_THRESHOLD
    level := "critical"
} else := level if {
    composite_risk_score >= HIGH_RISK_THRESHOLD
    level := "high"
} else := level if {
    composite_risk_score >= MEDIUM_RISK_THRESHOLD
    level := "medium"
} else := "low"

# Block access for critical risk
block_access if {
    risk_level == "critical"
}

# Require approval for high risk
requires_approval if {
    risk_level in ["high", "critical"]
}

# Count risk indicators of specific type
count_risk_indicators(indicator_type) := normalized_count if {
    indicators := [indicator | indicator := input.risk_indicators[_]; indicator.type == indicator_type]
    count := count(indicators)
    # Normalize to 0-1 scale (assume max 10 indicators)
    normalized_count := min(count / 10.0, 1.0)
}

# Calculate trust score change (negative = decline)
trust_score_change := change if {
    current := input.current_trust_score
    previous := input.previous_trust_score
    delta := previous - current
    # Normalize decline (only count negative changes)
    change := max(delta, 0.0)
}

# Actions based on risk level
recommended_action := action if {
    risk_level == "critical"
    action := {
        "action": "BLOCK_AND_INVESTIGATE",
        "requires_human_review": true,
        "escalate_to": "security_team",
        "disable_account": true
    }
} else := action if {
    risk_level == "high"
    action := {
        "action": "REQUIRE_APPROVAL",
        "requires_human_review": true,
        "escalate_to": "manager",
        "additional_monitoring": true
    }
} else := action if {
    risk_level == "medium"
    action := {
        "action": "ENHANCED_MONITORING",
        "requires_human_review": false,
        "log_all_activities": true,
        "alert_security_team": true
    }
} else := action if {
    action := {
        "action": "ALLOW",
        "requires_human_review": false
    }
}

# Helper functions
min(a, b) = result if {
    a < b
    result := a
} else = b

max(a, b) = result if {
    a > b
    result := a
} else = b
