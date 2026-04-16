/**
 * Environment configuration with type-safe access to environment variables
 */

interface EnvConfig {
    // API Configuration
    apiBaseUrl: string;
    apiTimeout: number;

    // SSE Configuration
    sseUrl: string;
    sseReconnectDelay: number;

    // WebSocket Configuration
    wsUrl: string;

    // Keycloak Configuration
    keycloakUrl: string;
    keycloakRealm: string;
    keycloakClientId: string;

    // Feature Flags
    enableRealtime: boolean;
    enableDebug: boolean;
    enableMockData: boolean;

    // Environment
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
}

const getEnv = (key: string, defaultValue: string = ''): string => {
    const value = import.meta.env[key];
    if (value === undefined) {
        if (import.meta.env.DEV && !defaultValue) {
            console.warn(`Environment variable ${key} is not defined`);
        }
        return defaultValue;
    }
    return value;
};

const getBoolEnv = (key: string, defaultValue = false): boolean => {
    const value = getEnv(key);
    if (!value) return defaultValue;
    return value === 'true' || value === '1';
};

const getNumberEnv = (key: string, defaultValue: number): number => {
    const value = getEnv(key);
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvConfig = {
    // API Configuration
    apiBaseUrl: getEnv('VITE_API_BASE_URL', '/'),
    apiTimeout: getNumberEnv('VITE_API_TIMEOUT', 30000),

    // SSE Configuration
    sseUrl: getEnv('VITE_SSE_URL', getEnv('VITE_SSE_BASE_URL', '/')),
    sseReconnectDelay: getNumberEnv('VITE_SSE_RECONNECT_DELAY', 3000),

    // WebSocket Configuration
    wsUrl: getEnv('VITE_WS_URL', 'ws://localhost:3000/ws'),

    // Keycloak Configuration
    keycloakUrl: getEnv('VITE_KEYCLOAK_URL', 'http://localhost:8180'),
    keycloakRealm: getEnv('VITE_KEYCLOAK_REALM', 'insightx'),
    keycloakClientId: getEnv('VITE_KEYCLOAK_CLIENT_ID', 'insightx-ui'),

    // Feature Flags
    enableRealtime: getBoolEnv('VITE_ENABLE_REALTIME', true),
    enableDebug: getBoolEnv('VITE_ENABLE_DEBUG', import.meta.env.DEV),
    enableMockData: getBoolEnv('VITE_ENABLE_MOCK_DATA', false),

    // Environment
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
};

export default env;

