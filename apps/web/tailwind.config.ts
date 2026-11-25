import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/themes/src/**/*.{ts,tsx}',
    '../admin/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        webzy: {
          primary: '#E11D63',
          accent: '#F59E0B',
          ink: '#2B1B2E',
          surface: '#FFF5F8',
          tint: '#FFE8EF',
        },
      },
      borderRadius: {
        xs: '0.125rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        '2xs': '0 1px 0 0 rgba(43, 27, 46, 0.04)',
        xs: '0 1px 2px 0 rgba(43, 27, 46, 0.05)',
        card: '0 2px 8px -2px rgba(43, 27, 46, 0.05), 0 8px 24px -4px rgba(43, 27, 46, 0.08)',
        'card-hover': '0 8px 16px -2px rgba(43, 27, 46, 0.08), 0 20px 40px -4px rgba(225, 29, 99, 0.14)',
        'glow-primary': '0 0 24px -4px rgba(225, 29, 99, 0.35)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.35)',
        'elevation-1': '0 1px 3px rgba(43, 27, 46, 0.06), 0 1px 2px rgba(43, 27, 46, 0.04)',
        'elevation-2': '0 4px 10px -1px rgba(43, 27, 46, 0.08), 0 2px 5px -1px rgba(43, 27, 46, 0.04)',
        'elevation-3': '0 12px 24px -4px rgba(43, 27, 46, 0.10), 0 4px 8px -2px rgba(43, 27, 46, 0.05)',
        physical: '0 0 0 1px rgba(255, 255, 255, 0.7) inset, 0 1px 3px 0 rgba(43, 27, 46, 0.05), 0 6px 16px -2px rgba(43, 27, 46, 0.06)',
        'physical-hover': '0 0 0 1px rgba(255, 255, 255, 0.9) inset, 0 4px 12px -2px rgba(43, 27, 46, 0.08), 0 16px 32px -4px rgba(225, 29, 99, 0.12)',
        'btn-primary': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.35), 0 2px 4px 0 rgba(225, 29, 99, 0.25), 0 8px 16px -4px rgba(225, 29, 99, 0.35)',
        'btn-secondary': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 1px 2px 0 rgba(43, 27, 46, 0.05)',
        'floating-phone': '0 25px 60px -15px rgba(225, 29, 99, 0.18), 0 10px 25px -5px rgba(43, 27, 46, 0.08)',
      },
      letterSpacing: {
        'tighter-display': '-0.035em',
        'tight-display': '-0.025em',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        float: 'float 3.5s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'var(--font-devanagari)', 'Georgia', 'serif'],
        sans: [
          'var(--font-jakarta)',
          'var(--font-devanagari)',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
