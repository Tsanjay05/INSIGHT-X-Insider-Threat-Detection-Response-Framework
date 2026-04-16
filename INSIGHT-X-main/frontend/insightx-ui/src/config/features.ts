/**
 * Feature flag configuration
 */

import { env } from './env';

export interface FeatureFlags {
    // Real-time features
    enableRealtime: boolean;
    enableSSE: boolean;
    enableWebSocket: boolean;

    // UI Features
    enableDarkMode: boolean;
    enableAnimations: boolean;
    enableCharts: boolean;

    // Data Features
    enableMockData: boolean;
    enableCaching: boolean;
    enableOptimisticUpdates: boolean;

    // Advanced Features
    enableAdvancedSearch: boolean;
    enableBulkActions: boolean;
    enableExport: boolean;

    // Debug
    enableDebug: boolean;
    enablePerformanceMonitoring: boolean;
}

/**
 * Feature flag configuration with environment-based defaults
 */
export const features: FeatureFlags = {
    // Real-time features
    enableRealtime: env.enableRealtime,
    enableSSE: env.enableRealtime,
    enableWebSocket: env.enableRealtime,

    // UI Features (always enabled for now)
    enableDarkMode: true,
    enableAnimations: true,
    enableCharts: true,

    // Data Features
    enableMockData: env.enableMockData,
    enableCaching: !env.isTest,
    enableOptimisticUpdates: true,

    // Advanced Features (enabled in production)
    enableAdvancedSearch: true,
    enableBulkActions: true,
    enableExport: true,

    // Debug
    enableDebug: env.enableDebug,
    enablePerformanceMonitoring: env.isDevelopment,
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    return features[feature];
};

/**
 * Runtime feature toggle (for testing/development)
 */
export const toggleFeature = (feature: keyof FeatureFlags, enabled?: boolean): void => {
    if (env.isDevelopment || env.isTest) {
        features[feature] = enabled ?? !features[feature];
        console.log(`Feature "${feature}" is now ${features[feature] ? 'enabled' : 'disabled'}`);
    }
};

export default features;
