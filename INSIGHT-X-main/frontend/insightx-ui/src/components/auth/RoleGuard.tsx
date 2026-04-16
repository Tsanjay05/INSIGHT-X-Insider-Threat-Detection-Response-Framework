import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/api/auth.types';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { user, hasAnyRole } = useAuth();

    if (!user) {
        return <>{fallback}</>;
    }

    if (hasAnyRole(allowedRoles)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

export { type UserRole };
