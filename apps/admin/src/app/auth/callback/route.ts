import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminMfaRequired, logEvent } from '@webzy/core';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { createSupabaseServerClient } from '../../../../../../infra/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const otpType = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const authErrorCode = requestUrl.searchParams.get('error');

  if (authErrorCode) {
    logEvent('warn', 'admin.auth.provider_error', { errorCode: authErrorCode });
    return NextResponse.redirect(
      new URL('/login?error=Admin+login+link+expired+or+cancelled.', request.url),
    );
  }

  if (!code && !(tokenHash && otpType)) {
    logEvent('warn', 'admin.auth.missing_code', {});
    return NextResponse.redirect(
      new URL('/login?error=Missing+admin+login+code.+Request+a+fresh+link.', request.url),
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const authResult = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: otpType! });

    const { data, error } = authResult;

    if (error || !data.user) {
      logEvent('warn', 'admin.auth.verify_failed', { reason: error?.code || 'no_user' });
      return NextResponse.redirect(
        new URL('/login?error=Admin+login+link+invalid+or+expired.', request.url),
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== 'admin' || profile.is_banned) {
      logEvent('warn', 'admin.auth.non_admin_blocked', { userId: data.user.id });
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/login?error=Access+denied.+Run+seed:admin+for+this+email+first.', request.url),
      );
    }

    await writeAuditLog({
      actorId: data.user.id,
      action: 'admin_magic_link_login',
      entity: 'auth',
      entityId: data.user.id,
    });

    if (!isAdminMfaRequired()) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal2') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.redirect(new URL('/mfa', request.url));
  } catch (err) {
    logEvent('error', 'admin.auth.callback_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.redirect(
      new URL('/login?error=Admin+callback+failed.+Please+retry.', request.url),
    );
  }
}
