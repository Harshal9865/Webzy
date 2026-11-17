import { NextResponse, type NextRequest } from 'next/server';
import {
  logEvent,
  validateCheckoutConsent,
  validateProfileInput,
  WebzyError,
} from '@webzy/core';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '../../../../../../infra/supabase/server';

export async function GET() {
  try {
    const session = await getAuthSessionState();
    if (!session.configured) {
      return NextResponse.json(
        { error: 'Supabase is not configured yet.', retryable: false },
        { status: 503 },
      );
    }
    if (!session.user) {
      return NextResponse.json(
        { error: 'Authentication required.', retryable: true },
        { status: 401 },
      );
    }
    if (session.profile?.is_banned) {
      return NextResponse.json(
        { error: 'Account access is restricted. Contact support.', retryable: false },
        { status: 403 },
      );
    }

    return NextResponse.json({
      profile: session.profile ?? {
        id: session.user.id,
        full_name: '',
        email: session.user.email || '',
        phone: '',
        role: 'user',
        is_banned: false,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    logEvent('error', 'web.profile.get_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to fetch profile. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'profile_patch',
      maxHits: 30,
      windowSeconds: 60,
    });
    if (guard) return guard;

    const session = await getAuthSessionState();
    if (!session.configured) {
      return NextResponse.json(
        { error: 'Supabase is not configured yet.', retryable: false },
        { status: 503 },
      );
    }
    if (!session.user) {
      return NextResponse.json(
        { error: 'Please login again.', retryable: true },
        { status: 401 },
      );
    }
    if (session.profile?.is_banned) {
      logEvent('warn', 'web.profile.banned_blocked', { userId: session.user.id });
      return NextResponse.json(
        { error: 'Account access is restricted. Contact support.', retryable: false },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      fullName?: unknown;
      phone?: unknown;
      consent?: {
        ageOrParentConfirmed?: boolean;
        termsAndRefundAccepted?: boolean;
        photoPermissionConfirmed?: boolean;
        hasPhotos?: boolean;
      };
    };

    const cleaned = validateProfileInput({
      fullName: body.fullName,
      phone: body.phone,
    });

    const supabase = await createSupabaseServerClient();
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update({
        full_name: cleaned.fullName,
        phone: cleaned.phone,
      })
      .eq('id', session.user.id)
      .select('id, full_name, email, phone, role, is_banned, created_at')
      .single();

    if (updateErr) {
      logEvent('error', 'web.profile.db_update_failed', {
        userId: session.user.id,
        dbCode: updateErr.code || 'unknown',
      });
      throw new WebzyError('Unable to save profile right now. Please retry.', {
        code: 'PROFILE_UPDATE_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    let consentCount = 0;
    if (body.consent) {
      const records = validateCheckoutConsent({
        ageOrParentConfirmed: Boolean(body.consent.ageOrParentConfirmed),
        termsAndRefundAccepted: Boolean(body.consent.termsAndRefundAccepted),
        photoPermissionConfirmed: Boolean(body.consent.photoPermissionConfirmed),
        hasPhotos: Boolean(body.consent.hasPhotos),
      });

      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '';
      const userAgent = (request.headers.get('user-agent') || '').slice(0, 200);

      // Write via admin client so direct client consent_log RLS remains locked down (0003)
      const writer = getSupabaseEnv().adminConfigured ? createSupabaseAdminClient() : supabase;
      const { error: consentErr } = await writer.from('consent_log').insert(
        records.map((rec) => ({
          user_id: session.user!.id,
          policy: rec.policy,
          version: rec.version,
          ip,
          user_agent: userAgent,
        })),
      );

      if (consentErr) {
        logEvent('error', 'web.consent.insert_failed', {
          userId: session.user.id,
          dbCode: consentErr.code || 'unknown',
        });
        throw new WebzyError('Profile saved, but consent log failed. Please retry.', {
          code: 'CONSENT_INSERT_FAILED',
          statusCode: 500,
          retryable: true,
        });
      }
      consentCount = records.length;
    }

    logEvent('info', 'web.profile.updated', {
      userId: session.user.id,
      consentCount,
    });

    return NextResponse.json({
      ok: true,
      profile: updatedProfile,
      consentRecorded: consentCount,
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      logEvent('warn', 'web.profile.validation_or_app_error', {
        code: err.code,
        statusCode: err.statusCode,
      });
      return NextResponse.json(
        { error: err.message, code: err.code, retryable: err.retryable },
        { status: err.statusCode },
      );
    }
    logEvent('error', 'web.profile.patch_error', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to save details right now. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}
