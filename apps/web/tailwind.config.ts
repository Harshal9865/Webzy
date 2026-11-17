import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/themes/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        webzy: {
          primary: '#E11D63',
          accent: '#F59E0B',
          ink: '#2B1B2E',
          surface: '#FFF5F8',
          tint: '#FFE8EF',
        },
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
