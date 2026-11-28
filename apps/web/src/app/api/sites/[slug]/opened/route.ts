import { NextResponse, type NextRequest } from 'next/server';
import { logEvent } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../../infra/supabase/server';

const BOT_UA_PATTERN =
  /whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|discordbot|linkedinbot|bot|crawler|spider/i;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const ua = request.headers.get('user-agent') || '';
    if (BOT_UA_PATTERN.test(ua)) {
      return NextResponse.json({ ok: true, ignoredBot: true });
    }

    const { slug } = await context.params;
    if (!slug || !/^[A-Za-z0-9_-]{6,64}$/.test(slug)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rl = await consumeRateLimit({
      key: `site-open:${slug}:${hashIpForRateLimit(ip)}`,
      maxHits: 30,
      windowSeconds: 300,
    });
    if (!rl.allowed) {
      return NextResponse.json({ ok: true, throttled: true });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select('id, status, hidden, first_opened_at, views_count, reveal_at, expires_at, is_lifetime, deleted_at')
      .eq('slug', slug)
      .maybeSingle();

    if (!site || site.deleted_at || site.hidden || site.status === 'removed') {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const nowMs = Date.now();
    if (!site.is_lifetime && site.expires_at && Date.parse(site.expires_at) <= nowMs) {
      return NextResponse.json({ ok: false }, { status: 410 });
    }

    if (site.status === 'scheduled' && site.reveal_at && Date.parse(site.reveal_at) > nowMs) {
      return NextResponse.json({ ok: true, waitingReveal: true });
    }

    const nowIso = new Date().toISOString();
    await Promise.all([
      admin
        .from('sites')
        .update({
          status: 'live',
          first_opened_at: site.first_opened_at ?? nowIso,
          views_count: (site.views_count ?? 0) + 1,
        })
        .eq('id', site.id),
      admin.from('site_events').insert({
        site_id: site.id,
        type: 'open',
        meta: { firstOpen: !site.first_opened_at },
      }),
    ]);

    return NextResponse.json({ ok: true, firstOpen: !site.first_opened_at });
  } catch (err) {
    logEvent('warn', 'web.site.opened_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
