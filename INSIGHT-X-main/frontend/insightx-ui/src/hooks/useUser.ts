/**
 * User management hook with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '@/api/users';
import type { UserFilters, CreateUserRequest, UpdateUserRequest } from '@/api/users.types';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Fetch users list
 */
export const useUsers = (filters?: UserFilters) => {
    return useQuery({
        queryKey: [QUERY_KEYS.USERS, filters],
        queryFn: () => usersApi.getUsers(filters),
    });
};

/**
 * Fetch single user by ID
 */
export const useUser = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.USER, id],
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    });
};

/**
 * Fetch user activity
 */
export const useUserActivity = (id: string, page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: [QUERY_KEYS.USER, id, 'activity', page, pageSize],
        queryFn: () => usersApi.getUserActivity(id, page, pageSize),
        enabled: !!id,
    });
};

/**
 * Fetch user sessions
 */
export const useUserSessions = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.USER, id, 'sessions'],
        queryFn: () => usersApi.getUserSessions(id),
        enabled: !!id,
    });
};

/**
 * Create user mutation
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => usersApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
        },
    });
};

/**
 * Update user mutation
 */
export const useUpdateUser = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserRequest) => usersApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, id] });
        },
    });
};

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
        },
    });
};

/**
 * Revoke session mutation
 */
export const useRevokeSession = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => usersApi.revokeSession(userId, sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'sessions'] });
        },
    });
};
