import { NextResponse, type NextRequest } from 'next/server';
import { verifySameOriginRequest } from '../../../infra/security/origin';
import { updateSupabaseSession } from '../../../infra/supabase/middleware';

function applySecurityHeaders(response: NextResponse, isApiRoute: boolean): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  if (isApiRoute) {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const method = request.method.toUpperCase();

  if (
    isApiRoute &&
    method !== 'GET' &&
    method !== 'HEAD' &&
    method !== 'OPTIONS' &&
    !verifySameOriginRequest(request)
  ) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 }),
      true,
    );
  }

  const response = await updateSupabaseSession(request);
  return applySecurityHeaders(response, isApiRoute);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
