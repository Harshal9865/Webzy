import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '../../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'auth_attach_draft',
      maxHits: 30,
      windowSeconds: 60,
    });
    if (guard) return guard;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { draftToken?: string };
    let draftToken = typeof body.draftToken === 'string' ? body.draftToken.trim() : '';

    if (!draftToken) {
      const cookieVal = request.cookies.get('webzy_pending_draft')?.value;
      if (cookieVal && typeof cookieVal === 'string') {
        draftToken = cookieVal.trim();
      }
    }

    if (draftToken.length < 16) {
      return NextResponse.json({ ok: true, attached: false });
    }

    const { adminConfigured } = getSupabaseEnv();
    if (!adminConfigured) {
      return NextResponse.json({ ok: true, attached: false });
    }

    const admin = createSupabaseAdminClient();
    const tokenHashSha = crypto.createHash('sha256').update(draftToken).digest('hex');

    const { data: claimedId, error: rpcErr } = await admin.rpc('claim_anonymous_draft', {
      p_token_hash: tokenHashSha,
      p_user_id: user.id,
    });

    if (rpcErr) {
      const nowIso = new Date().toISOString();
      await admin
        .from('drafts')
        .update({ user_id: user.id, updated_at: nowIso })
        .eq('draft_token', draftToken)
        .is('user_id', null)
        .is('deleted_at', null)
        .gt('expires_at', nowIso);
    } else if (claimedId) {
      logEvent('info', 'web.auth.otp_draft_attached', { userId: user.id, draftId: claimedId });
    }

    const response = NextResponse.json({ ok: true, attached: true });
    response.cookies.delete('webzy_pending_draft');
    return response;
  } catch (err) {
    logEvent('warn', 'web.auth.attach_draft_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
