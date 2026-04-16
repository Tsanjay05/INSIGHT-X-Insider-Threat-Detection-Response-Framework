/**
 * Permission guard component - shows content only if user has permissions
 */

import { useAuth } from '@/hooks/useAuth';
import type { Permission } from '@/api/auth.types';

interface PermissionGuardProps {
    children: React.ReactNode;
    permissions: Permission | Permission[];
    requireAll?: boolean; // true = ALL permissions required, false = ANY permission required
    fallback?: React.ReactNode;
    showUnauthorized?: boolean;
}

export function PermissionGuard({
    children,
    permissions,
    requireAll = false,
    fallback,
    showUnauthorized = false,
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission } = useAuth();

    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

    const hasAccess = requireAll
        ? permissionArray.every((p) => hasPermission(p))
        : hasAnyPermission(permissionArray);

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (showUnauthorized) {
            return (
                <div className="p-4 bg-semantic-danger-bg border border-semantic-danger-400 rounded-lg">
                    <p className="text-sm text-semantic-danger-400">
                        You do not have permission to access this feature.
                    </p>
                </div>
            );
        }

        return null;
    }

    return <>{children}</>;
}
