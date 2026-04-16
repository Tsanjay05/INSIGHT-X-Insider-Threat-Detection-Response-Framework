import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, get, post } from './client';

vi.mock('@/config/env', () => ({
    env: {
        enableMockData: false,
        apiBaseUrl: 'http://localhost:8080/api/v1',
        apiTimeout: 30000,
        sseUrl: 'http://localhost:8080/sse',
    },
}));

describe('API Client', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should make a GET request with params', async () => {
        const mockResponse = { data: 'test' };
        const requestSpy = vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
            data: mockResponse,
        } as any);

        const response = await get('/test-endpoint', { q: 'term', page: 1 });

        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'GET',
                url: '/test-endpoint',
                params: { q: 'term', page: 1 },
            })
        );
        expect(response).toEqual(mockResponse);
    });

    it('should make a POST request with body', async () => {
        const mockResponse = { success: true };
        const requestBody = { name: 'test' };
        const requestSpy = vi.spyOn(apiClient, 'request').mockResolvedValueOnce({
            data: mockResponse,
        } as any);

        const response = await post('/submit', requestBody);

        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                url: '/submit',
                data: requestBody,
            })
        );
        expect(response).toEqual(mockResponse);
    });

    it('should throw on request failure', async () => {
        vi.spyOn(apiClient, 'request').mockRejectedValueOnce(new Error('Bad Request'));

        await expect(get('/fail')).rejects.toThrow('Bad Request');
    });
});
