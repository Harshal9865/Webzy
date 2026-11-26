import type { NextConfig } from 'next';

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://*.supabase.co';
const supabaseWsOrigin = supabaseOrigin.replace(/^http(s?):\/\//i, (_, s) => (s ? 'wss://' : 'ws://'));

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${supabaseOrigin} data:`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin} wss://*.supabase.co`,
  "font-src 'self' https://fonts.gstatic.com data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
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
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
