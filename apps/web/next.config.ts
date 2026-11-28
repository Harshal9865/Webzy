import type { NextConfig } from 'next';

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://*.supabase.co';
const supabaseWsOrigin = supabaseOrigin.replace(/^http(s?):\/\//i, (_, s) => (s ? 'wss://' : 'ws://'));

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${supabaseOrigin} data: blob: https:`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin} wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com`,
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  transpilePackages: ['@webzy/core', '@webzy/themes', '@webzy/jobs'],
  experimental: {
    externalDir: true,
    optimizePackageImports: ['@webzy/core', '@webzy/themes'],
  },
  async headers() {
    return [
      {
        source: '/templates/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=(self)' },
        ],
      },
      {
        source: '/(s|i|mock-pay|success|account|orders|profile|login|create|preview|checkout|edit|admin)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/(s|i|mock-pay|success|account|orders|profile|login|create|preview|checkout|edit|admin)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};

export default nextConfig;
