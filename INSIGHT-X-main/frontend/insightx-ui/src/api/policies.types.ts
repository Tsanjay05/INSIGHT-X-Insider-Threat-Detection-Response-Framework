/**
 * Policy types and interfaces
 */

export type PolicyStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type PolicyType = 'PREVENTION' | 'DETECTION' | 'RESPONSE' | 'COMPLIANCE';
export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'NOT_IN';

export interface Policy {
    id: string;
    name: string;
    description: string;
    type: PolicyType;
    status: PolicyStatus;
    enabled: boolean;
    priority: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastTriggered?: string;
    triggerCount: number;
}

export interface PolicyDetail extends Policy {
    rules: PolicyRule[];
    enforcementHistory: PolicyEnforcementEvent[];
    affectedEntities: string[];
    tags: string[];
    notes?: string;
}

export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    enabled: boolean;
}

export interface PolicyCondition {
    field: string;
    operator: ConditionOperator;
    value: string | number | boolean;
}

export interface PolicyAction {
    type: 'BLOCK' | 'ALERT' | 'LOG' | 'REQUIRE_MFA' | 'RESTRICT_ACCESS' | 'NOTIFY' | 'QUARANTINE';
    parameters: Record<string, unknown>;
}

export interface PolicyEnforcementEvent {
    id: string;
    policyId: string;
    entityId: string;
    action: string;
    result: 'ENFORCED' | 'BYPASSED' | 'FAILED';
    timestamp: string;
    details?: string;
}

export interface PolicyFilters {
    search?: string;
    type?: PolicyType;
    status?: PolicyStatus;
    enabled?: boolean;
    page?: number;
    pageSize?: number;
}

export interface PolicyListResponse {
    policies: Policy[];
    total: number;
    page: number;
    pageSize: number;
}
