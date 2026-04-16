/**
 * Design system theme configuration
 */

export const theme = {
    colors: {
        // Trust Score Colors
        trust: {
            critical: {
                main: '#DC2626',
                light: '#EF4444',
                dark: '#991B1B',
                bg: 'rgba(220, 38, 38, 0.1)',
            },
            low: {
                main: '#F59E0B',
                light: '#FBBF24',
                dark: '#B45309',
                bg: 'rgba(245, 158, 11, 0.1)',
            },
            medium: {
                main: '#10B981',
                light: '#34D399',
                dark: '#059669',
                bg: 'rgba(16, 185, 129, 0.1)',
            },
            high: {
                main: '#3B82F6',
                light: '#60A5FA',
                dark: '#1D4ED8',
                bg: 'rgba(59, 130, 246, 0.1)',
            },
        },

        // Status Colors
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },

        // UI Colors (from Tailwind config)
        primary: {
            50: '#E6F0FF',
            500: '#0D4FCC',
            600: '#0A3E99',
        },

        neutral: {
            50: '#FFFFFF',
            100: '#F5F5F7',
            500: '#6E6E73',
            800: '#1C1C1E',
            900: '#080C08',
        },
    },

    typography: {
        fontFamily: {
            sans: 'Inter Tight, system-ui, sans-serif',
            mono: 'JetBrains Mono, monospace',
        },

        fontSize: {
            h1: { size: '32px', lineHeight: '1.2', weight: '700' },
            h2: { size: '24px', lineHeight: '1.3', weight: '700' },
            h3: { size: '20px', lineHeight: '1.4', weight: '600' },
            h4: { size: '18px', lineHeight: '1.4', weight: '600' },
            h5: { size: '16px', lineHeight: '1.5', weight: '500' },
            body: { size: '14px', lineHeight: '1.5', weight: '400' },
            small: { size: '12px', lineHeight: '1.4', weight: '400' },
            caption: { size: '11px', lineHeight: '1.3', weight: '400' },
        },
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
    },

    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
    },

    animations: {
        transition: {
            fast: '150ms',
            base: '200ms',
            slow: '300ms',
        },

        easing: {
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },

    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
} as const;

export default theme;
