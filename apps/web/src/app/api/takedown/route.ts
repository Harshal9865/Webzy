import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
import { guardMutationRequest, verifyTurnstileIfConfigured } from '../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

const ALLOWED_CATEGORIES = new Set([
  'copyright',
  'privacy',
  'impersonation',
  'harassment',
  'scam',
  'other',
]);

const AUTO_HIDE_CATEGORIES = new Set(['privacy', 'impersonation', 'harassment', 'scam']);

function extractSlugFromInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/(?:i|s)\/([A-Za-z0-9_-]{3,64})/);
  if (match?.[1]) return match[1];
  if (/^[A-Za-z0-9_-]{4,64}$/.test(trimmed)) return trimmed;
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'takedown_requests',
      maxHits: 6,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Database is not configured yet.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      siteUrlOrSlug?: string;
      reporterName?: string;
      reporterEmail?: string;
      category?: string;
      details?: string;
      turnstileToken?: string;
    };

    const turnstileOk = await verifyTurnstileIfConfigured(request, body.turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Security check could not be completed. Please refresh and try again.' },
        { status: 403 },
      );
    }

    const reporterName = (body.reporterName || '').trim().slice(0, 80);
    const reporterEmail = (body.reporterEmail || '').trim().toLowerCase().slice(0, 120);
    const category =
      typeof body.category === 'string' && ALLOWED_CATEGORIES.has(body.category)
        ? body.category
        : 'other';
    const details = (body.details || '').trim().slice(0, 1200);
    const slug = extractSlugFromInput(body.siteUrlOrSlug || '');

    if (reporterName.length < 2 || !reporterEmail.includes('@') || details.length < 15) {
      return NextResponse.json(
        { error: 'Please provide your name, a valid email, and clear details (at least 15 characters).' },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();
    let matchedSite: { id: string; status: string; hidden: boolean } | null = null;

    if (slug) {
      const { data: site } = await admin
        .from('sites')
        .select('id, status, hidden')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();
      matchedSite = site;
    }

    let initialStatus: 'pending' | 'hidden_site' = 'pending';
    if (matchedSite && AUTO_HIDE_CATEGORIES.has(category) && matchedSite.status !== 'removed') {
      await admin
        .from('sites')
        .update({ hidden: true, status: 'hidden' })
        .eq('id', matchedSite.id);
      initialStatus = 'hidden_site';

      await admin.from('moderation_log').insert({
        who: null,
        what: 'auto_hidden_takedown',
        why: `Takedown notice (${category}) submitted for /s/${slug}`,
      });
    }

    const { data: created, error } = await admin
      .from('takedown_requests')
      .insert({
        site_slug: slug || (body.siteUrlOrSlug || '').trim().slice(0, 120),
        site_id: matchedSite?.id ?? null,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        category,
        details,
        status: initialStatus,
      })
      .select('id')
      .single();

    if (error || !created) {
      logEvent('error', 'web.takedown.insert_failed', { code: error?.code || 'unknown' });
      return NextResponse.json({ error: 'Unable to record takedown notice right now.' }, { status: 500 });
    }

    const cfg = getWebzyPublicConfig();
    const alertEmail = process.env.SEED_ADMIN_EMAIL || cfg.business.grievanceEmail;
    await sendTransactionalEmail({
      to: alertEmail,
      subject: `[URGENT Takedown] ${category} notice (${slug || 'no-slug'})`,
      idempotencyKey: `takedown_alert_${created.id}`,
      text: [
        `Takedown Notice (#${created.id.slice(0, 8)})`,
        `Category: ${category} | Status: ${initialStatus}`,
        `Link / Slug: ${slug || body.siteUrlOrSlug || 'Not specified'}`,
        `Reporter: ${reporterName} <${reporterEmail}>`,
        '',
        'Details:',
        details,
      ].join('\n'),
    });

    logEvent('warn', 'web.takedown.submitted', {
      takedownId: created.id,
      category,
      autoHidden: initialStatus === 'hidden_site',
    });

    return NextResponse.json({
      ok: true,
      takedownId: created.id,
      autoHidden: initialStatus === 'hidden_site',
    });
  } catch (err) {
    logEvent('warn', 'web.takedown.error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not submit takedown notice.' }, { status: 500 });
  }
}
