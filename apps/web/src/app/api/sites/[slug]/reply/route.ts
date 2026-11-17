import { NextResponse, type NextRequest } from 'next/server';
import { detectScamPatterns, logEvent } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../../infra/supabase/env';
import { consumeRateLimit, hashIpForRateLimit } from '../../../../../../../../infra/supabase/rateLimit';
import { createSupabaseAdminClient } from '../../../../../../../../infra/supabase/server';

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
      key: `site-reply:${slug}:${hashIpForRateLimit(ip)}`,
      maxHits: 10,
      windowSeconds: 300,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as { replyText?: string };
    const cleanReply = typeof body.replyText === 'string' ? body.replyText.trim() : '';
    if (cleanReply.length < 1 || cleanReply.length > 160) {
      return NextResponse.json({ error: 'Please enter a short reply (1-160 characters).' }, { status: 400 });
    }

    const scam = detectScamPatterns(cleanReply);
    if (!scam.allowed) {
      return NextResponse.json({ error: 'Reply contains restricted links or text.' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: site } = await admin
      .from('sites')
      .select('id, status, hidden, reply_text, replied_at, deleted_at, expires_at')
      .eq('slug', slug)
      .maybeSingle();

    if (!site || site.deleted_at || site.hidden || site.status !== 'live') {
      return NextResponse.json({ error: 'This page cannot accept replies right now.' }, { status: 404 });
    }

    if (site.replied_at) {
      return NextResponse.json({ ok: true, alreadyReplied: true, replyText: site.reply_text });
    }

    const nowIso = new Date().toISOString();
    await admin
      .from('sites')
      .update({
        reply_text: cleanReply,
        replied_at: nowIso,
      })
      .eq('id', site.id)
      .is('replied_at', null);

    await admin.from('site_events').insert({
      site_id: site.id,
      type: 'reply',
      meta: { replyText: cleanReply },
    });

    logEvent('info', 'web.site.reply_saved', { siteId: site.id });
    return NextResponse.json({ ok: true, replyText: cleanReply });
  } catch (err) {
    logEvent('warn', 'web.site.reply_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Unable to save reply right now.' }, { status: 500 });
  }
}
