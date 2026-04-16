package insightx.access.control

import future.keywords.if
import future.keywords.in

# Access control policy - enforces trust-based access restrictions

default allow = false

# Trust-based access tiers
TIER_CRITICAL_ACCESS_THRESHOLD := 0.8
TIER_HIGH_ACCESS_THRESHOLD := 0.6
TIER_STANDARD_ACCESS_THRESHOLD := 0.4
TIER_RESTRICTED_ACCESS_THRESHOLD := 0.2

# Data classification levels
CLASSIFICATION_CRITICAL := "CRITICAL"
CLASSIFICATION_RESTRICTED := "RESTRICTED"
CLASSIFICATION_CONFIDENTIAL := "CONFIDENTIAL"
CLASSIFICATION_INTERNAL := "INTERNAL"
CLASSIFICATION_PUBLIC := "PUBLIC"

# Main access control decision
allow if {
    trust_sufficient_for_resource
    not anomalous_access_pattern
    within_business_hours_or_approved
}

# Trust score must meet resource classification requirements
trust_sufficient_for_resource if {
    input.resource.classification == CLASSIFICATION_CRITICAL
    input.user.trust_score >= TIER_CRITICAL_ACCESS_THRESHOLD
}

trust_sufficient_for_resource if {
    input.resource.classification == CLASSIFICATION_RESTRICTED
    input.user.trust_score >= TIER_HIGH_ACCESS_THRESHOLD
}

trust_sufficient_for_resource if {
    input.resource.classification == CLASSIFICATION_CONFIDENTIAL
    input.user.trust_score >= TIER_STANDARD_ACCESS_THRESHOLD
}

trust_sufficient_for_resource if {
    input.resource.classification in [CLASSIFICATION_INTERNAL, CLASSIFICATION_PUBLIC]
    input.user.trust_score >= TIER_RESTRICTED_ACCESS_THRESHOLD
}

# Detect anomalous access patterns
anomalous_access_pattern if {
    unusual_time_access
}

anomalous_access_pattern if {
    unusual_location_access
}

anomalous_access_pattern if {
    peer_group_deviation
}

# Check if access is during unusual hours
unusual_time_access if {
    not input.context.is_business_hours
    not approved_after_hours_user
}

approved_after_hours_user if {
    input.user.role in ["security_engineer", "ciso", "incident_responder"]
}

# Check if access is from unusual location
unusual_location_access if {
    not input.context.location in input.user.typical_locations
    input.resource.classification == CLASSIFICATION_CRITICAL
}

# Check if access deviates from peer group behavior
peer_group_deviation if {
    input.peer_group_access_count < 3
    input.resource.classification in [CLASSIFICATION_CRITICAL, CLASSIFICATION_RESTRICTED]
}

# Business hours check
within_business_hours_or_approved if {
    input.context.is_business_hours
}

within_business_hours_or_approved if {
    approved_after_hours_user
}

# Denial reasons for logging
denial_reason := reason if {
    not trust_sufficient_for_resource
    reason := sprintf("Insufficient trust score %.2f for resource classification %s", [
        input.user.trust_score,
        input.resource.classification
    ])
} else := reason if {
    anomalous_access_pattern
    reason := "Anomalous access pattern detected"
} else := reason if {
    not within_business_hours_or_approved
    reason := "Access outside business hours not approved for this user"
} else := "Access denied"

# Return full decision context
decision := result if {
    result := {
        "allow": allow,
        "trust_score": input.user.trust_score,
        "resource_classification": input.resource.classification,
        "denial_reason": denial_reason,
        "timestamp": time.now_ns()
    }
}
