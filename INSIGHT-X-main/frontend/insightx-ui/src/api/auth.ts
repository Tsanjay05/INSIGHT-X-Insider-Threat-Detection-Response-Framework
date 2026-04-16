/**
 * Authentication API client
 */

import axios from 'axios';
import { get, post, put } from './client';
import { setAccessToken, getAccessToken, setRefreshToken, getRefreshToken, clearTokens } from './tokenStorage';
import type {
    LoginRequest,
    LoginResponse,
    User,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenResponse,
} from './auth.types';

export { setAccessToken, getAccessToken, setRefreshToken, getRefreshToken, clearTokens };

type HttpMethod = 'GET' | 'POST' | 'PUT';

const AUTH_BASE_PATHS = ['/api/v1/auth', '/auth'] as const;

const requestWithAuthPathFallback = async <T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown
): Promise<T> => {
    let lastError: unknown;

    for (let index = 0; index < AUTH_BASE_PATHS.length; index += 1) {
        const basePath = AUTH_BASE_PATHS[index];
        const path = `${basePath}${endpoint}`;

        try {
            if (method === 'GET') {
                return await get<T>(path);
            }

            if (method === 'PUT') {
                return await put<T>(path, data);
            }

            return await post<T>(path, data);
        } catch (error) {
            lastError = error;

            const isAxiosError = axios.isAxiosError(error);
            const isNotFound = isAxiosError && error.response?.status === 404;
            const hasMorePaths = index < AUTH_BASE_PATHS.length - 1;

            if (isNotFound && hasMorePaths) {
                continue;
            }

            throw error;
        }
    }

    throw lastError;
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    return requestWithAuthPathFallback<LoginResponse>('POST', '/login', credentials);
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    try {
        await requestWithAuthPathFallback<void>('POST', '/logout');
    } catch (error) {
        console.warn('Logout API call failed', error);
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return requestWithAuthPathFallback<RefreshTokenResponse>('POST', '/refresh', { refreshToken });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
    return requestWithAuthPathFallback<User>('GET', '/me');
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
    return requestWithAuthPathFallback<User>('PUT', '/profile', data);
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    return requestWithAuthPathFallback<void>('POST', '/change-password', data);
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
    return requestWithAuthPathFallback<void>('POST', '/forgot-password', data);
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
    return requestWithAuthPathFallback<void>('POST', '/reset-password', data);
};

