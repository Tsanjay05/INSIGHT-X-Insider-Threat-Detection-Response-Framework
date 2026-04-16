/**
 * Application route constants and navigation helpers
 */

export const ROUTES = {
    HOME: '/',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Users
    USERS: '/users',
    USER_DETAIL: '/users/:id',

    // Alerts
    ALERTS: '/alerts',
    ALERT_DETAIL: '/alerts/:id',

    // Cases
    CASES: '/cases',
    CASE_DETAIL: '/cases/:id',
    CASE_NEW: '/cases/new',

    // Controls
    CONTROLS: '/controls',
    CONTROL_DETAIL: '/controls/:id',

    // Campaigns
    CAMPAIGNS: '/campaigns',
    CAMPAIGN_DETAIL: '/campaigns/:id',

    // Intent
    INTENT: '/intent',
    INTENT_DETAIL: '/intent/:id',

    // Provenance
    PROVENANCE: '/provenance',
    PROVENANCE_DETAIL: '/provenance/:id',

    // Policies
    POLICIES: '/policies',
    POLICY_DETAIL: '/policies/:id',

    // Reports
    REPORTS: '/reports',
    REPORT_DETAIL: '/reports/:id',

    // Approvals
    APPROVALS: '/approvals',
    APPROVAL_DETAIL: '/approvals/:id',

    // Settings
    SETTINGS: '/settings',
    SETTINGS_PROFILE: '/settings/profile',
    SETTINGS_SECURITY: '/settings/security',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_API: '/settings/api',

    // Auth (future)
    LOGIN: '/login',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
} as const;

/**
 * Build a route with parameters
 */
export const buildRoute = (route: string, params: Record<string, string | number>): string => {
    let path = route;
    for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, String(value));
    }
    return path;
};

/**
 * Check if a route requires authentication
 */
export const requiresAuth = (path: string): boolean => {
    const publicRoutes: readonly string[] = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];
    return !publicRoutes.includes(path);
};

/**
 * Get the page title for a route
 */
export const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
        [ROUTES.DASHBOARD]: 'Dashboard',
        [ROUTES.USERS]: 'Users',
        [ROUTES.ALERTS]: 'Alerts',
        [ROUTES.CASES]: 'Cases',
        [ROUTES.CONTROLS]: 'Controls',
        [ROUTES.CAMPAIGNS]: 'Campaigns',
        [ROUTES.INTENT]: 'Intent Analysis',
        [ROUTES.PROVENANCE]: 'Provenance',
        [ROUTES.POLICIES]: 'Policies',
        [ROUTES.REPORTS]: 'Reports',
        [ROUTES.APPROVALS]: 'Approvals',
        [ROUTES.SETTINGS]: 'Settings',
    };

    return titleMap[path] || 'INSIGHT-X';
};
