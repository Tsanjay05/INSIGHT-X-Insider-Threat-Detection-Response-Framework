/**
 * Protected route wrapper - requires authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Permission } from '@/api/auth.types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermissions?: Permission[];
    requireAll?: boolean; // true = ALL permissions required, false = ANY permission required
}

export function ProtectedRoute({
    children,
    requiredPermissions,
    requireAll = false,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasPermission, hasAnyPermission } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
        const hasAccess = requireAll
            ? requiredPermissions.every((p) => hasPermission(p))
            : hasAnyPermission(requiredPermissions);

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
}
