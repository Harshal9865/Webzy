import { NextResponse } from 'next/server';
import { evaluateAdminAccess, isAdminMfaRequired } from '@webzy/core';
import { verifySameOriginRequest } from '../../../../infra/security/origin';
import { getAuthSessionState } from '../../../../infra/supabase/auth';
import { createSupabaseAdminClient } from '../../../../infra/supabase/server';

export async function requireVerifiedAdmin(request?: Request) {
  if (request && !verifySameOriginRequest(request)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Cross-origin request rejected.' },
        { status: 403 },
      ),
    };
  }

  const session = await getAuthSessionState();
  const requireMfa = isAdminMfaRequired();
  const gate = evaluateAdminAccess({
    isAuthenticated: Boolean(session.user),
    role: session.profile?.role,
    aal: session.aal,
    isBanned: session.profile?.is_banned,
    requireMfa,
  });

  if (gate !== 'allowed' || !session.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: requireMfa
            ? 'Verified Admin + 2FA (AAL2) required.'
            : 'Verified Admin login required.',
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    userId: session.user.id,
    email: session.profile?.email || session.user.email || '',
    admin: createSupabaseAdminClient(),
  };
}
