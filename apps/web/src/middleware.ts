import type { NextRequest } from 'next/server';
import { updateSupabaseSession } from '../../../infra/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

// Run session refresh only on auth-protected / payment routes for fast storefront browsing
export const config = {
  matcher: [
    '/account/:path*',
    '/login',
    '/auth/callback',
    '/checkout',
    '/mock-pay/:path*',
    '/success/:path*',
    '/edit/:path*',
    '/api/profile',
    '/api/orders',
  ],
};
