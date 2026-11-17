import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../../infra/supabase/server';

const ALLOWED_REASONS = [
  'Spam or scam content',
  'Harassment or unwanted contact',
  'Privacy concern or unauthorized photo',
  'Inappropriate content',
] as const;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
    }

    const { slug } = await context.params;
    if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid link.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rl = await consumeRateLimit({
      key: `site-report:${slug}:${hashIpForRateLimit(ip)}`,
      maxHits: 5,
      windowSeconds: 600,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many report requests.' }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const rawReason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 120) : '';
    const reason = rawReason || ALLOWED_REASONS[0];

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select('id, status, hidden, deleted_at')
      .eq('slug', slug)
      .maybeSingle();

    if (!site || site.deleted_at) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const ua = request.headers.get('user-agent') || 'unknown';
    const salt = process.env.MOCK_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'webzy-salt';
    const deviceHash = crypto
      .createHmac('sha256', salt)
      .update(`${ip}|${ua.slice(0, 120)}`)
      .digest('hex');

    await admin.from('reports').upsert(
      {
        site_id: site.id,
        reason,
        status: 'pending',
        device_hash: deviceHash,
      },
      { onConflict: 'site_id,device_hash', ignoreDuplicates: true },
    );

    // Instant safety auto-hide on report (Section 19 & Trust rule)
    await admin
      .from('sites')
      .update({
        hidden: true,
        status: 'hidden',
      })
      .eq('id', site.id);

    await admin.from('site_events').insert({
      site_id: site.id,
      type: 'report',
      meta: { reason },
    });

    await admin.from('moderation_log').insert({
      who: null,
      what: 'auto_hidden_site',
      why: `Reported by receiver (${reason}) for site ${site.id}`,
    });

    logEvent('warn', 'web.site.reported_and_hidden', { siteId: site.id, reason });
    return NextResponse.json({ ok: true, hidden: true });
  } catch (err) {
    logEvent('warn', 'web.site.report_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not submit report.' }, { status: 500 });
  }
}
