/**
 * Permission and role utilities
 */

import type { User, Permission } from '@/api/auth.types';
import { UserRole, PERMISSIONS } from '@/api/auth.types';

// Role hierarchy (higher roles inherit lower role permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.ADMIN]: 4,
    [UserRole.SECURITY_ANALYST]: 3,
    [UserRole.ANALYST]: 2,
    [UserRole.VIEWER]: 1,
};

// Default permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        PERMISSIONS.SYSTEM_ADMIN,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.CONTROLS_VIEW,
        PERMISSIONS.CONTROLS_APPROVE,
        PERMISSIONS.CONTROLS_REVOKE,
        PERMISSIONS.CASES_VIEW,
        PERMISSIONS.CASES_CREATE,
        PERMISSIONS.CASES_UPDATE,
        PERMISSIONS.CASES_CLOSE,
        PERMISSIONS.POLICIES_VIEW,
        PERMISSIONS.POLICIES_MANAGE,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_GENERATE,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_MANAGE,
    ],
    [UserRole.SECURITY_ANALYST]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.CONTROLS_VIEW,
        PERMISSIONS.CONTROLS_APPROVE,
        PERMISSIONS.CASES_VIEW,
        PERMISSIONS.CASES_CREATE,
        PERMISSIONS.CASES_UPDATE,
        PERMISSIONS.CASES_CLOSE,
        PERMISSIONS.POLICIES_VIEW,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_GENERATE,
        PERMISSIONS.SETTINGS_VIEW,
    ],
    [UserRole.ANALYST]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.CONTROLS_VIEW,
        PERMISSIONS.CASES_VIEW,
        PERMISSIONS.CASES_CREATE,
        PERMISSIONS.POLICIES_VIEW,
        PERMISSIONS.REPORTS_VIEW,
    ],
    [UserRole.VIEWER]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.CONTROLS_VIEW,
        PERMISSIONS.CASES_VIEW,
        PERMISSIONS.POLICIES_VIEW,
        PERMISSIONS.REPORTS_VIEW,
    ],
};

/**
 * Check if user has a specific permission
 */
export const checkPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) return false;

    // Admins have all permissions
    if (user.role === UserRole.ADMIN) return true;

    // Check explicit permissions
    if (user.permissions.includes(permission)) return true;

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const checkAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
    return permissions.some((permission) => checkPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const checkAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
    return permissions.every((permission) => checkPermission(user, permission));
};

/**
 * Check if user has a specific role
 */
export const checkRole = (user: User | null, role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
};

/**
 * Check if user has any of the specified roles
 */
export const checkAnyRole = (user: User | null, roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
};

/**
 * Check if user's role is at least the specified minimum role
 */
export const checkMinimumRole = (user: User | null, minimumRole: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minimumRole];
};

/**
 * Get all permissions for a user (role-based + explicit)
 */
export const getUserPermissions = (user: User | null): Permission[] => {
    if (!user) return [];

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const explicitPermissions = user.permissions as Permission[];

    // Combine and deduplicate
    return [...new Set([...rolePermissions, ...explicitPermissions])];
};

/**
 * Check if user can perform action on resource
 */
export const canPerformAction = (
    user: User | null,
    action: string,
    resource: string
): boolean => {
    const permission = `${resource}:${action}` as Permission;
    return checkPermission(user, permission);
};
