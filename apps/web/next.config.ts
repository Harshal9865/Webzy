import type { NextConfig } from 'next';

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://*.supabase.co';
const supabaseWsOrigin = supabaseOrigin.replace(/^http(s?):\/\//i, (_, s) => (s ? 'wss://' : 'ws://'));

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${supabaseOrigin} data: blob: https:`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin} wss://*.supabase.co`,
  "font-src 'self' https://fonts.gstatic.com data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  transpilePackages: ['@webzy/core', '@webzy/themes', '@webzy/jobs'],
  experimental: {
    externalDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
      {
        source: '/(s|mock-pay|success|account|login|create|preview|checkout|edit|admin)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/(s|mock-pay|success|account|login|create|preview|checkout|edit|admin)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};

export default nextConfig;
