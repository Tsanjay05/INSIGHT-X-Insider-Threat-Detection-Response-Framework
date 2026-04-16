/**
 * Token Storage Utilities
 * Separated from auth.ts to avoid circular dependencies
 */

export const setAccessToken = (token: string): void => {
    sessionStorage.setItem('accessToken', token);
};

export const getAccessToken = (): string | null => {
    return sessionStorage.getItem('accessToken');
};

export const setRefreshToken = (token: string): void => {
    localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem('refreshToken');
};

export const clearTokens = (): void => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
