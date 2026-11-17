import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { WebzyError } from '@webzy/core';
import { getSupabaseEnv } from './env';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured) {
    throw new WebzyError('Supabase environment variables are not configured yet.', {
      code: 'SUPABASE_NOT_CONFIGURED',
      statusCode: 503,
      retryable: false,
    });
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies during render; route handlers/middleware handle refresh.
        }
      },
    },
  });
}

export function createSupabaseAdminClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new WebzyError('Service role client must never run in the browser.', {
      code: 'SERVER_ONLY_VIOLATION',
      statusCode: 500,
      retryable: false,
    });
  }

  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new WebzyError('SUPABASE_SERVICE_ROLE_KEY is not configured yet.', {
      code: 'SUPABASE_ADMIN_NOT_CONFIGURED',
      statusCode: 503,
      retryable: false,
    });
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
