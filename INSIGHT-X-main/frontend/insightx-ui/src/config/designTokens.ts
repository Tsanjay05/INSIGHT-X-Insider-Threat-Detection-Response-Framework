/**
 * Design Tokens for INSIGHT-X
 * Generated from design.json - DO NOT EDIT MANUALLY
 * Version: 1.0.0
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
    primary: {
        50: '#E6F0FF',
        100: '#B3D4FF',
        200: '#80B8FF',
        300: '#4D9CFF',
        400: '#306FFF',
        500: '#0D4FCC',
        600: '#0A3E99',
        700: '#072D66',
        800: '#051F44',
        900: '#021022',
    },
    accent: {
        cyan: {
            400: '#30F0B3',
            500: '#1DD9A0',
            600: '#16B383',
        },
        yellow: {
            400: '#FAD670',
            500: '#F5C842',
            600: '#D4A820',
        },
    },
    semantic: {
        success: {
            400: '#30F0B3',
            500: '#1DD9A0',
            600: '#16B383',
            background: 'rgba(48, 240, 179, 0.1)',
        },
        warning: {
            400: '#FAD670',
            500: '#F5C842',
            600: '#D4A820',
            background: 'rgba(250, 214, 112, 0.1)',
        },
        danger: {
            400: '#FF5C5C',
            500: '#FF3333',
            600: '#E61A1A',
            background: 'rgba(255, 92, 92, 0.1)',
        },
        info: {
            400: '#7B9FFF',
            500: '#5580FF',
            600: '#3366FF',
            background: 'rgba(123, 159, 255, 0.1)',
        },
    },
    neutral: {
        50: '#FFFFFF',
        100: '#F5F5F7',
        200: '#E5E5EA',
        300: '#C4C4CC',
        400: '#9E9EA7',
        500: '#6E6E73',
        600: '#48484D',
        700: '#2C2C2E',
        800: '#1C1C1E',
        900: '#080C08',
        950: '#000000',
    },
    background: {
        primary: '#080C08',
        secondary: '#1C1C1E',
        tertiary: '#2C2C2E',
        elevated: '#36363A',
        overlay: 'rgba(0, 0, 0, 0.6)',
    },
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)',
        disabled: 'rgba(255, 255, 255, 0.3)',
        inverse: '#080C08',
    },
    border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        default: 'rgba(255, 255, 255, 0.12)',
        strong: 'rgba(255, 255, 255, 0.18)',
        focus: '#306FFF',
    },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
    fontFamily: {
        sans: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
        h1: {
            size: '32px',
            lineHeight: '1.2',
            fontWeight: '700',
            letterSpacing: '-0.02em',
        },
        h2: {
            size: '24px',
            lineHeight: '1.3',
            fontWeight: '700',
            letterSpacing: '-0.01em',
        },
        h3: {
            size: '20px',
            lineHeight: '1.4',
            fontWeight: '600',
            letterSpacing: '0',
        },
        h4: {
            size: '18px',
            lineHeight: '1.4',
            fontWeight: '600',
            letterSpacing: '0',
        },
        h5: {
            size: '16px',
            lineHeight: '1.5',
            fontWeight: '500',
            letterSpacing: '0',
        },
        body: {
            size: '14px',
            lineHeight: '1.5',
            fontWeight: '400',
            letterSpacing: '0',
        },
        bodySmall: {
            size: '12px',
            lineHeight: '1.4',
            fontWeight: '400',
            letterSpacing: '0',
        },
        caption: {
            size: '11px',
            lineHeight: '1.3',
            fontWeight: '400',
            letterSpacing: '0',
        },
    },
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
    '2xl': '0 24px 48px rgba(0, 0, 0, 0.7)',
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
    duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
    },
    easing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================================================
// TRUST SCORE RANGES
// ============================================================================

export const trustScoreRanges = {
    high: {
        min: 80,
        max: 100,
        gradient: 'linear-gradient(135deg, #30F0B3, #16B383)',
        label: 'High Trust',
        severity: 'low' as const,
        color: colors.semantic.success[400],
    },
    medium: {
        min: 60,
        max: 79,
        gradient: 'linear-gradient(135deg, #306FFF, #0A3E99)',
        label: 'Medium Trust',
        severity: 'medium' as const,
        color: colors.primary[400],
    },
    low: {
        min: 40,
        max: 59,
        gradient: 'linear-gradient(135deg, #FAD670, #D4A820)',
        label: 'Low Trust',
        severity: 'high' as const,
        color: colors.semantic.warning[400],
    },
    critical: {
        min: 0,
        max: 39,
        gradient: 'linear-gradient(135deg, #FF5C5C, #E61A1A)',
        label: 'Critical Trust',
        severity: 'critical' as const,
        color: colors.semantic.danger[400],
    },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get trust range configuration based on score
 */
export const getTrustRange = (score: number) => {
    if (score >= 80) return trustScoreRanges.high;
    if (score >= 60) return trustScoreRanges.medium;
    if (score >= 40) return trustScoreRanges.low;
    return trustScoreRanges.critical;
};

/**
 * Get trust gradient based on score
 */
export const getTrustGradient = (score: number): string => {
    const range = getTrustRange(score);
    return range.gradient;
};

/**
 * Get trust label based on score
 */
export const getTrustLabel = (score: number): string => {
    const range = getTrustRange(score);
    return range.label;
};

/**
 * Get trust color based on score
 */
export const getTrustColor = (score: number): string => {
    const range = getTrustRange(score);
    return range.color;
};

/**
 * Get severity color for alerts/cases
 */
export const getSeverityColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string => {
    const severityMap = {
        LOW: colors.neutral[400],
        MEDIUM: colors.semantic.info[400],
        HIGH: colors.semantic.warning[400],
        CRITICAL: colors.semantic.danger[400],
    };
    return severityMap[severity];
};

/**
 * Get severity background color
 */
export const getSeverityBackground = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string => {
    const severityMap = {
        LOW: 'rgba(158, 158, 167, 0.1)',
        MEDIUM: colors.semantic.info.background,
        HIGH: colors.semantic.warning.background,
        CRITICAL: colors.semantic.danger.background,
    };
    return severityMap[severity];
};

// ============================================================================
// COMPONENT SPECIFICATIONS
// ============================================================================

export const components = {
    button: {
        primary: {
            background: 'linear-gradient(135deg, #306FFF, #0D4FCC)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
        },
        secondary: {
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
        },
        danger: {
            background: 'linear-gradient(135deg, #FF5C5C, #E61A1A)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
        },
        ghost: {
            background: 'transparent',
            padding: '8px',
            borderRadius: '6px',
            color: 'rgba(255, 255, 255, 0.7)',
        },
    },
    card: {
        default: {
            background: '#2C2C2E',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
        },
        elevated: {
            background: '#2C2C2E',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '20px',
        },
        glass: {
            background: 'rgba(44, 44, 46, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
        },
    },
    modal: {
        overlay: {
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
        },
        container: {
            background: '#2C2C2E',
            borderRadius: '12px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
            maxWidth: {
                small: '600px',
                medium: '800px',
                large: '1200px',
            },
        },
        header: {
            background: '#1C1C1E',
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
        body: {
            background: '#2C2C2E',
            padding: '24px',
        },
        footer: {
            background: '#1C1C1E',
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        },
    },
    badge: {
        critical: {
            background: 'rgba(255, 92, 92, 0.1)',
            color: '#FF5C5C',
            border: '1px solid rgba(255, 92, 92, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
        },
        high: {
            background: 'rgba(250, 214, 112, 0.1)',
            color: '#FAD670',
            border: '1px solid rgba(250, 214, 112, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
        },
        medium: {
            background: 'rgba(123, 159, 255, 0.1)',
            color: '#7B9FFF',
            border: '1px solid rgba(123, 159, 255, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
        },
        low: {
            background: 'rgba(158, 158, 167, 0.1)',
            color: '#9E9EA7',
            border: '1px solid rgba(158, 158, 167, 0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
        },
    },
    toggle: {
        width: '44px',
        height: '24px',
        circleDiameter: '18px',
        off: {
            background: '#48484D',
            circlePosition: 'left',
        },
        on: {
            background: '#306FFF',
            circlePosition: 'right',
        },
        transition: 'all 200ms ease',
    },
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
    sidebar: {
        width: {
            expanded: '240px',
            collapsed: '64px',
        },
    },
    topbar: {
        height: '64px',
    },
    container: {
        maxWidth: '1920px',
        padding: {
            desktop: '24px',
            mobile: '16px',
        },
    },
    grid: {
        columns: 12,
        gutter: {
            desktop: '16px',
            mobile: '12px',
        },
    },
} as const;

// Export all as default
export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    breakpoints,
    trustScoreRanges,
    components,
    layout,
    // Helper functions
    getTrustRange,
    getTrustGradient,
    getTrustLabel,
    getTrustColor,
    getSeverityColor,
    getSeverityBackground,
};
