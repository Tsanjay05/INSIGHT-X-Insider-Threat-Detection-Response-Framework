/**
 * Report types and interfaces
 */

export type ReportStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
export type ReportType = 'COMPLIANCE' | 'INCIDENT' | 'RISK_ASSESSMENT' | 'AUDIT_TRAIL' | 'EXECUTIVE_SUMMARY' | 'CUSTOM';
export type ReportFormat = 'PDF' | 'CSV' | 'JSON' | 'HTML';

export interface Report {
    id: string;
    title: string;
    description: string;
    type: ReportType;
    status: ReportStatus;
    format: ReportFormat;
    createdBy: string;
    createdAt: string;
    completedAt?: string;
    dateRangeStart: string;
    dateRangeEnd: string;
    fileSize?: number;
    downloadUrl?: string;
}

export interface ReportDetail extends Report {
    sections: ReportSection[];
    summary: ReportSummary;
    schedule?: ReportSchedule;
    tags: string[];
}

export interface ReportSection {
    id: string;
    title: string;
    content: string;
    order: number;
    metrics?: ReportMetric[];
}

export interface ReportMetric {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'UP' | 'DOWN' | 'STABLE';
}

export interface ReportSummary {
    totalAlerts: number;
    totalCases: number;
    totalControls: number;
    riskScore: number;
    complianceRate: number;
    keyFindings: string[];
}

export interface ReportSchedule {
    id: string;
    reportId: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    nextRunAt: string;
    recipients: string[];
    enabled: boolean;
}

export interface ReportFilters {
    search?: string;
    type?: ReportType;
    status?: ReportStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

export interface ReportListResponse {
    reports: Report[];
    total: number;
    page: number;
    pageSize: number;
}
