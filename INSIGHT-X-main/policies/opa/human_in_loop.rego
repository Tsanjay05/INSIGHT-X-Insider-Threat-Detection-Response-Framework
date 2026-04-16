# INSIGHT-X OPA Policy: Human-in-the-Loop Requirements (FR-6.4)
# Employment-impacting actions require approval

package insightx.human_in_loop

# Actions that require human approval
require_approval[action] {
    action := input.action
    action in {"revoke_access", "disable_account", "privilege_decay", "containment"}
}

# Approval timeout (hours)
approval_timeout_hours := 24

# HR visibility separation - actions visible to HR
hr_visible_actions := {"revoke_access", "disable_account"}
