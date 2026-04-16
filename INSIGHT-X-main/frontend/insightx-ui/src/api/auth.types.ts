/**
 * Authentication types and interfaces
 */

export enum UserRole {
    ADMIN = 'ADMIN',
    ANALYST = 'ANALYST',
    SECURITY_ANALYST = 'SECURITY_ANALYST',
    VIEWER = 'VIEWER',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    permissions: string[];
    avatar?: string;
    department?: string;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    trustScore?: number;
    riskLevel?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    avatar?: string;
    department?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// Permission constants
export const PERMISSIONS = {
    // User management
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',

    // Controls
    CONTROLS_VIEW: 'controls:view',
    CONTROLS_APPROVE: 'controls:approve',
    CONTROLS_REVOKE: 'controls:revoke',

    // Cases
    CASES_VIEW: 'cases:view',
    CASES_CREATE: 'cases:create',
    CASES_UPDATE: 'cases:update',
    CASES_CLOSE: 'cases:close',

    // Policies
    POLICIES_VIEW: 'policies:view',
    POLICIES_MANAGE: 'policies:manage',

    // Reports
    REPORTS_VIEW: 'reports:view',
    REPORTS_GENERATE: 'reports:generate',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_MANAGE: 'settings:manage',

    // System
    SYSTEM_ADMIN: 'system:admin',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
