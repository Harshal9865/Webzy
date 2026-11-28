import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, WebzyError } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normal consumer sign-up endpoint (Full Name + Email + Password).
 * Creates a confirmed Supabase Auth user + profile row so ANY visitor can
 * create an account and sign in immediately without hitting Supabase's 2/hr
 * default confirmation email rate limit.
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'auth_register',
      maxHits: 15,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { error: 'Authentication service is not configured yet.' },
        { status: 503 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      fullName?: string;
      email?: string;
      password?: string;
    };

    const cleanName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 80) : '';
    const cleanEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (cleanName.length < 2) {
      throw new WebzyError('Please enter your name (at least 2 characters).', {
        code: 'REGISTER_INVALID_NAME',
        statusCode: 400,
      });
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      throw new WebzyError('Please enter a valid email address.', {
        code: 'REGISTER_INVALID_EMAIL',
        statusCode: 400,
      });
    }

    if (password.length < 8 || password.length > 72) {
      throw new WebzyError('Password must be between 8 and 72 characters.', {
        code: 'REGISTER_INVALID_PASSWORD',
        statusCode: 400,
      });
    }

    const admin = createSupabaseAdminClient();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
      },
    });

    if (createErr || !created.user) {
      const msg = (createErr?.message || '').toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('duplicate')
      ) {
        return NextResponse.json(
          {
            error:
              'An account with this email already exists. Switch to "Sign In" or use "Email Link" if you signed up without a password.',
            code: 'ACCOUNT_EXISTS',
          },
          { status: 409 },
        );
      }
      logEvent('warn', 'web.auth.register_failed', {
        reason: (createErr?.message || 'unknown').slice(0, 80),
      });
      return NextResponse.json(
        { error: createErr?.message || 'Could not create account right now. Please retry.' },
        { status: 400 },
      );
    }

    await admin.from('profiles').upsert(
      {
        id: created.user.id,
        email: cleanEmail,
        full_name: cleanName,
        role: 'user',
        is_banned: false,
      },
      { onConflict: 'id' },
    );

    logEvent('info', 'web.auth.registered', { userId: created.user.id });

    return NextResponse.json({ ok: true, userId: created.user.id }, { status: 201 });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    logEvent('error', 'web.auth.register_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to create account right now. Please retry.' },
      { status: 500 },
    );
  }
}
