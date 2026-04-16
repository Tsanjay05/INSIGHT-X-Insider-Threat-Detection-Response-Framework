/**
 * User management types and interfaces
 */

import { User, UserRole, UserStatus } from './auth.types';

// Re-export for convenience
export { UserRole, UserStatus };


export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UserDetail extends User {
    bio?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    trustScore?: number;
    riskLevel?: string;
    lastActivity?: string;
    sessionCount?: number;
}

export interface UserActivity {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
}

export interface UserFilters {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    department?: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'name' | 'email' | 'lastLogin' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface CreateUserRequest {
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    permissions?: string[];
    sendInvite?: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    department?: string;
    permissions?: string[];
    avatar?: string;
}

export interface UserSession {
    id: string;
    userId: string;
    device: string;
    browser: string;
    ipAddress: string;
    location?: string;
    createdAt: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface UserActivityLog {
    activities: UserActivity[];
    total: number;
    page: number;
    pageSize: number;
}
