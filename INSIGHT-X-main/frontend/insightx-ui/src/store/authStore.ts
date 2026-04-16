/**
 * Authentication Zustand store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as authApi from '@/api/auth';
import type { User, LoginRequest, Permission } from '@/api/auth.types';
import { checkPermission, checkRole, checkAnyPermission, getUserPermissions } from '@/lib/permissions';
import type { UserRole } from '@/api/auth.types';

interface AuthState {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
    clearError: () => void;

    // Permission helpers
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasRole: (role: UserRole) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    getPermissions: () => Permission[];
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // Login action
                login: async (credentials: LoginRequest) => {
                    set({ isLoading: true, error: null });

                    try {
                        const response = await authApi.login(credentials);

                        // Store tokens
                        authApi.setAccessToken(response.accessToken);
                        if (credentials.rememberMe) {
                            authApi.setRefreshToken(response.refreshToken);
                        }

                        // Update state
                        set({
                            user: response.user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : 'Login failed',
                            isLoading: false,
                            isAuthenticated: false,
                            user: null,
                        });
                        throw error;
                    }
                },

                // Logout action
                logout: async () => {
                    set({ isLoading: true });

                    try {
                        await authApi.logout();
                    } catch (error) {
                        console.error('Logout error:', error);
                    } finally {
                        // Clear tokens
                        authApi.clearTokens();

                        // Reset state
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });
                    }
                },

                // Check authentication status
                checkAuth: async () => {
                    const token = authApi.getAccessToken();

                    if (!token) {
                        set({ isAuthenticated: false, user: null, isLoading: false });
                        return;
                    }

                    set({ isLoading: true });

                    try {
                        const user = await authApi.getCurrentUser();
                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        // Token invalid, clear auth
                        authApi.clearTokens();
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });
                    }
                },

                // Set user manually (for updates)
                setUser: (user: User | null) => {
                    set({ user, isAuthenticated: !!user });
                },

                // Clear error
                clearError: () => {
                    set({ error: null });
                },

                // Permission helpers
                hasPermission: (permission: Permission) => {
                    const { user } = get();
                    return checkPermission(user, permission);
                },

                hasAnyPermission: (permissions: Permission[]) => {
                    const { user } = get();
                    return checkAnyPermission(user, permissions);
                },

                hasRole: (role: UserRole) => {
                    const { user } = get();
                    return checkRole(user, role);
                },

                hasAnyRole: (roles: UserRole[]) => {
                    const { user } = get();
                    if (!user) return false;
                    return roles.includes(user.role);
                },

                getPermissions: () => {
                    const { user } = get();
                    return getUserPermissions(user);
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    // Only persist user data, not loading/error states
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
);

// Export hook for easy access
export const useAuth = () => useAuthStore();
