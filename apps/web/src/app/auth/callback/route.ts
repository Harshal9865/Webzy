import type { EmailOtpType } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, sanitizeRedirectPath } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '../../../../../../infra/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const otpType = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const authErrorCode = requestUrl.searchParams.get('error');
  const nextPath = sanitizeRedirectPath(requestUrl.searchParams.get('next'), '/account');

  const loginFailureRedirect = (safeReason: string) =>
    NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(safeReason)}&next=${encodeURIComponent(nextPath)}`,
        request.url,
      ),
    );

  if (authErrorCode) {
    logEvent('warn', 'web.auth.callback_provider_error', { errorCode: authErrorCode });
    return loginFailureRedirect('Login link expired or was cancelled. Please request a new link.');
  }

  if (!code && !(tokenHash && otpType)) {
    logEvent('warn', 'web.auth.callback_missing_code', {});
    return loginFailureRedirect('Missing login code. Please request a fresh magic link.');
  }

  try {
    const supabase = await createSupabaseServerClient();
    const authResult = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: otpType! });

    const { data, error } = authResult;

    if (error || !data.user) {
      logEvent('warn', 'web.auth.callback_failed', { reason: error?.code || 'no_user' });
      return loginFailureRedirect('Login link expired or invalid. Please try again.');
    }

    // Attach anonymous pre-login draft (Section 9)
    const cookieStore = await cookies();
    const pendingDraftToken = cookieStore.get('webzy_pending_draft')?.value;
    const { adminConfigured } = getSupabaseEnv();

    if (pendingDraftToken && pendingDraftToken.length >= 16 && adminConfigured) {
      try {
        const admin = createSupabaseAdminClient();
        const tokenHashSha = crypto
          .createHash('sha256')
          .update(pendingDraftToken)
          .digest('hex');

        const { data: claimedId, error: rpcErr } = await admin.rpc('claim_anonymous_draft', {
          p_token_hash: tokenHashSha,
          p_user_id: data.user.id,
        });

        if (rpcErr) {
          // Fallback if 0003 RPC hasn't been applied yet
          const nowIso = new Date().toISOString();
          const { error: fallbackErr } = await admin
            .from('drafts')
            .update({ user_id: data.user.id, updated_at: nowIso })
            .eq('draft_token', pendingDraftToken)
            .is('user_id', null)
            .is('deleted_at', null)
            .gt('expires_at', nowIso);

          if (fallbackErr) {
            logEvent('warn', 'web.auth.draft_attach_failed', { code: fallbackErr.code });
          } else {
            logEvent('info', 'web.auth.draft_attached_fallback', { userId: data.user.id });
          }
        } else if (claimedId) {
          logEvent('info', 'web.auth.draft_attached', { userId: data.user.id, draftId: claimedId });
        }
      } catch (draftErr) {
        logEvent('warn', 'web.auth.draft_attach_exception', {
          message: draftErr instanceof Error ? draftErr.message.slice(0, 80) : 'unknown',
        });
      }
    }

    logEvent('info', 'web.auth.login_success', { userId: data.user.id });
    const response = NextResponse.redirect(new URL(nextPath, request.url));
    if (pendingDraftToken) {
      response.cookies.delete('webzy_pending_draft');
    }
    return response;
  } catch (err) {
    logEvent('error', 'web.auth.callback_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return loginFailureRedirect('Something went wrong signing in. Please retry.');
  }
}
