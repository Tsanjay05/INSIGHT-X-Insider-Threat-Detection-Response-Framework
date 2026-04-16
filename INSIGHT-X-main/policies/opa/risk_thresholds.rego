# INSIGHT-X OPA Policy: Risk Threshold Definitions (FR-2.4)

package insightx.risk

# Risk severity levels
default risk_level := "low"

risk_level := "critical" {
    input.aggregate_risk > 0.9
}

risk_level := "high" {
    input.aggregate_risk > 0.7
    input.aggregate_risk <= 0.9
}

risk_level := "medium" {
    input.aggregate_risk > 0.4
    input.aggregate_risk <= 0.7
}

risk_level := "low" {
    input.aggregate_risk <= 0.4
}

# Response eligibility based on risk
response_eligible[action] {
    risk_level == "critical"
    action := "immediate_containment"
}

response_eligible[action] {
    risk_level == "high"
    action := "human_approval_required"
}

response_eligible[action] {
    risk_level == "medium"
    action := "heightened_monitoring"
}
