import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from './tokenStorage';
import { toast } from '@/lib/toast';

const API_BASE_URL = env.apiBaseUrl;
const SSE_BASE_URL = env.sseUrl;

const buildUrl = (baseUrl: string, path: string): string => {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBase}${normalizedPath}`;
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: env.apiTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    // We use axios directly to avoid interceptors loop, or a separate instance
                    const response = await axios.post(buildUrl(API_BASE_URL, '/auth/refresh'), { refreshToken });

                    const { accessToken } = response.data;
                    setAccessToken(accessToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                clearTokens();
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=true';
                    toast.error('Session expired. Please login again.');
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as Record<string, unknown> | undefined;
            const message = (data && typeof data.message === 'string' ? data.message : null) || error.message;

            console.error('API Error:', { status, message, url: error.config?.url });

            if (status === 403) {
                toast.error('You do not have permission to perform this action.');
            } else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            console.error('Network Error:', error.message);
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

// Helper type for Axios response data unwrapping
// We want `get<T>` to return `Promise<T>`
export async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: any,
    params?: Record<string, any>,
    config?: { signal?: AbortSignal }
): Promise<T> {
    const response = await apiClient.request<T>({
        method,
        url: path,
        data,
        params,
        signal: config?.signal,
    });
    return response.data;
}

// Convenience methods maintaining current signature
export const get = <T>(path: string, params?: Record<string, any>, config?: { signal?: AbortSignal }) => request<T>('GET', path, undefined, params, config);
export const post = <T>(path: string, data?: any, params?: Record<string, any>, config?: { signal?: AbortSignal }) => request<T>('POST', path, data, params, config);
export const put = <T>(path: string, data?: any, params?: Record<string, any>, config?: { signal?: AbortSignal }) => request<T>('PUT', path, data, params, config);
export const patch = <T>(path: string, data?: any, params?: Record<string, any>, config?: { signal?: AbortSignal }) => request<T>('PATCH', path, data, params, config);
export const del = <T>(path: string, params?: Record<string, any>, config?: { signal?: AbortSignal }) => request<T>('DELETE', path, undefined, params, config);

const normalizeSseBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');
const normalizeSsePath = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

export function createSSE(path: string): EventSource {
    const normalizedBase = normalizeSseBaseUrl(SSE_BASE_URL);
    const normalizedPath = normalizeSsePath(path);

    // Backward compatibility: older env files used `/sse` suffix while stream endpoints are under `/stream`.
    const effectiveBase = normalizedBase.endsWith('/sse') && normalizedPath.startsWith('/stream/')
        ? normalizedBase.slice(0, -4)
        : normalizedBase;

    const streamUrl = new URL(`${effectiveBase}${normalizedPath}`, window.location.origin);
    const accessToken = getAccessToken();
    if (accessToken) {
        streamUrl.searchParams.set('access_token', accessToken);
    }

    return new EventSource(streamUrl.toString());
}

export { API_BASE_URL, SSE_BASE_URL };
