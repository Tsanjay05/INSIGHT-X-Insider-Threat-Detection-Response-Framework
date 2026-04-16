/**
 * Case management types and interfaces
 */

export type CaseStatus = 'OPEN' | 'INVESTIGATING' | 'PENDING_ACTION' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Case {
    id: string;
    title: string;
    description: string;
    status: CaseStatus;
    priority: CasePriority;
    assignedTo?: string;
    subject: string;
    subjectEmail?: string;
    alertCount: number;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    slaDeadline?: string;
}

export interface CaseDetail extends Case {
    summary: string;
    findings: string;
    recommendation?: string;
    evidence: CaseEvidence[];
    timeline: CaseTimelineEvent[];
    comments: CaseComment[];
    relatedAlerts: string[];
    relatedControls: string[];
    tags: string[];
    riskScore: number;
}

export interface CaseEvidence {
    id: string;
    caseId: string;
    type: 'ALERT' | 'LOG' | 'SCREENSHOT' | 'FILE' | 'NOTE';
    title: string;
    description: string;
    source: string;
    addedBy: string;
    addedAt: string;
    metadata?: Record<string, unknown>;
}

export interface CaseTimelineEvent {
    id: string;
    type: 'CREATED' | 'STATUS_CHANGE' | 'COMMENT' | 'EVIDENCE_ADDED' | 'ASSIGNMENT' | 'ESCALATION' | 'SLA_BREACH';
    description: string;
    actor?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface CaseComment {
    id: string;
    caseId: string;
    author: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CaseFilters {
    search?: string;
    status?: CaseStatus;
    priority?: CasePriority;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CaseListResponse {
    cases: Case[];
    total: number;
    page: number;
    pageSize: number;
}
