/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
            bg: 'rgba(48, 240, 179, 0.1)',
          },
          warning: {
            400: '#FAD670',
            500: '#F5C842',
            600: '#D4A820',
            bg: 'rgba(250, 214, 112, 0.1)',
          },
          danger: {
            400: '#FF5C5C',
            500: '#FF3333',
            600: '#E61A1A',
            bg: 'rgba(255, 92, 92, 0.1)',
          },
          info: {
            400: '#7B9FFF',
            500: '#5580FF',
            600: '#3366FF',
            bg: 'rgba(123, 159, 255, 0.1)',
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
        bg: {
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
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        h3: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        h5: ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        bodySmall: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      spacing: {
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
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
        '2xl': '0 24px 48px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        rotate: 'rotate 800ms linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
