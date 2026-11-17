import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './env';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const { url, anonKey, configured } = getSupabaseEnv();
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!configured) {
    return response;
  }

  // Performance: avoid blocking public routes on remote Auth calls when no session cookie exists
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-'));
  if (!hasAuthCookie) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
