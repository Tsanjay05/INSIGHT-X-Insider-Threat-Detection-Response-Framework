/**
 * Authentication hook - provides auth state and operations
 */

import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const setUser = useAuthStore((state) => state.setUser);
    const clearError = useAuthStore((state) => state.clearError);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
    const hasRole = useAuthStore((state) => state.hasRole);
    const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
    const getPermissions = useAuthStore((state) => state.getPermissions);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
        setUser,
        clearError,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        getPermissions,
    };
};
