/**
 * Application constants and type definitions
 */

// ===========================
// Risk Levels
// ===========================

export enum RiskLevel {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: 'Critical',
    [RiskLevel.HIGH]: 'High',
    [RiskLevel.MEDIUM]: 'Medium',
    [RiskLevel.LOW]: 'Low',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: 'red',
    [RiskLevel.HIGH]: 'orange',
    [RiskLevel.MEDIUM]: 'yellow',
    [RiskLevel.LOW]: 'green',
};

// ===========================
// Trust Score Thresholds
// ===========================

export const TRUST_THRESHOLDS = {
    CRITICAL: 0,
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    MAXIMUM: 100,
} as const;

export const getTrustLevel = (score: number): RiskLevel => {
    if (score < TRUST_THRESHOLDS.LOW) return RiskLevel.CRITICAL;
    if (score < TRUST_THRESHOLDS.MEDIUM) return RiskLevel.LOW;
    if (score < TRUST_THRESHOLDS.HIGH) return RiskLevel.MEDIUM;
    return RiskLevel.HIGH;
};

// ===========================
// Control Status
// ===========================

export enum ControlStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
    REVOKED = 'REVOKED',
}

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
    [ControlStatus.ACTIVE]: 'Active',
    [ControlStatus.PENDING]: 'Pending',
    [ControlStatus.EXPIRED]: 'Expired',
    [ControlStatus.REVOKED]: 'Revoked',
};

// ===========================
// Case Status
// ===========================

export enum CaseStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

// ===========================
// Alert Severity
// ===========================

export enum AlertSeverity {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    INFO = 'INFO',
}

// ===========================
// Date and Time Formats
// ===========================

export const DATE_FORMATS = {
    SHORT: 'MMM d, yyyy',
    LONG: 'MMMM d, yyyy',
    WITH_TIME: 'MMM d, yyyy HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss",
    TIME_ONLY: 'HH:mm:ss',
    RELATIVE: 'relative', // e.g., "2 hours ago"
} as const;

// ===========================
// Pagination
// ===========================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
} as const;

// ===========================
// Polling Intervals (ms)
// ===========================

export const POLL_INTERVALS = {
    FAST: 5000, // 5 seconds
    NORMAL: 30000, // 30 seconds
    SLOW: 60000, // 1 minute
} as const;

// ===========================
// File Upload
// ===========================

export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/csv',
        'application/json',
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv', '.json'],
} as const;

// ===========================
// Local Storage Keys
// ===========================

export const STORAGE_KEYS = {
    TOKEN: 'insightx_token',
    REFRESH_TOKEN: 'insightx_refresh_token',
    USER: 'insightx_user',
    THEME: 'insightx_theme',
    SIDEBAR_COLLAPSED: 'insightx_sidebar_collapsed',
    PREFERENCES: 'insightx_preferences',
} as const;

// ===========================
// Query Keys (TanStack Query)
// ===========================

export const QUERY_KEYS = {
    USERS: 'users',
    USER: 'user',
    ALERTS: 'alerts',
    ALERT: 'alert',
    CASES: 'cases',
    CASE: 'case',
    CONTROLS: 'controls',
    CONTROL: 'control',
    CAMPAIGNS: 'campaigns',
    CAMPAIGN: 'campaign',
    INTENT: 'intent',
    PROVENANCE: 'provenance',
    POLICIES: 'policies',
    POLICY: 'policy',
    REPORTS: 'reports',
    REPORT: 'report',
    TRUST_STATE: 'trust_state',
    TRUST_HISTORY: 'trust_history',
} as const;

// ===========================
// WebSocket Events
// ===========================

export const WS_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    TRUST_UPDATE: 'trust_update',
    ALERT_NEW: 'alert_new',
    CONTROL_CHANGE: 'control_change',
    CASE_UPDATE: 'case_update',
} as const;

// ===========================
// Chart Constants
// ===========================

export const CHART_COLORS = {
    PRIMARY: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    TRUST: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6'],
    GRADIENT: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
} as const;

export const CHART_DEFAULT_MARGIN = {
    top: 10,
    right: 30,
    left: 0,
    bottom: 0,
};

// ===========================
// Validation
// ===========================

export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
} as const;

// ===========================
// Export All
// ===========================

export default {
    RiskLevel,
    RISK_LEVEL_LABELS,
    RISK_LEVEL_COLORS,
    TRUST_THRESHOLDS,
    ControlStatus,
    CONTROL_STATUS_LABELS,
    CaseStatus,
    AlertSeverity,
    DATE_FORMATS,
    PAGINATION,
    POLL_INTERVALS,
    FILE_UPLOAD,
    STORAGE_KEYS,
    QUERY_KEYS,
    WS_EVENTS,
    CHART_COLORS,
    CHART_DEFAULT_MARGIN,
    VALIDATION,
};
