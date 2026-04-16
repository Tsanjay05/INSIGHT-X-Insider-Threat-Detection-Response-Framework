/**
 * Alert types and interfaces
 */

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    status: AlertStatus;
    source: string;
    entityId: string;
    entityType: string;
    riskScore: number;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    acknowledgedAt?: string;
    resolvedAt?: string;
}

export interface AlertDetail extends Alert {
    rawEvent: Record<string, unknown>;
    relatedAlerts: string[];
    relatedControls: string[];
    affectedResources: string[];
    ipAddress?: string;
    location?: string;
    userAgent?: string;
    timeline: AlertTimelineEvent[];
    comments: AlertComment[];
    tags: string[];
}

export interface AlertTimelineEvent {
    id: string;
    type: 'CREATED' | 'STATUS_CHANGE' | 'COMMENT' | 'ESCALATION' | 'ASSIGNMENT' | 'CONTROL_APPLIED';
    description: string;
    actor?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface AlertComment {
    id: string;
    alertId: string;
    author: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AlertFilters {
    search?: string;
    severity?: AlertSeverity;
    status?: AlertStatus;
    source?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AlertListResponse {
    alerts: Alert[];
    total: number;
    page: number;
    pageSize: number;
}
