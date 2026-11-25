import { NextResponse } from 'next/server';
import { formatInr, getWebzyPublicConfig, logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
import { reportServerError } from '../../../../../../infra/sentry/monitor';
import { writeAuditLog } from '../../../../../../infra/supabase/auth';
import { requireVerifiedAdmin } from '../../../lib/requireAdmin';

const ALLOWED_STATUSES = new Set([
  'new',
  'reviewing',
  'in_progress',
  'quoted',
  'accepted',
  'made',
  'completed',
  'declined',
]);

function sanitizeHttpUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().slice(0, 300);
  } catch {
    return '';
  }
}

export async function PATCH(request: Request) {
  const guard = await requireVerifiedAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      requestId?: string;
      status?: string;
      quotedAmountInr?: number | null;
      adminNotes?: string;
      sendQuoteEmail?: boolean;
      checklist?: Record<string, boolean>;
      previewUrl?: string;
      liveUrl?: string;
    };

    const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId.' }, { status: 400 });
    }

    const mappedStatus =
      body.status === 'waitlisted'
        ? 'new'
        : body.status === 'contacted'
          ? 'reviewing'
          : body.status === 'converted'
            ? 'completed'
            : body.status;

    const status =
      typeof mappedStatus === 'string' && ALLOWED_STATUSES.has(mappedStatus)
        ? mappedStatus
        : 'reviewing';

    const { data: existing } = await guard.admin
      .from('custom_requests')
      .select('id, requester_name, requester_email, occasion, quoted_amount_inr')
      .eq('id', requestId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Custom request not found.' }, { status: 404 });
    }

    // Only update quoted_amount_inr if caller explicitly sent quotedAmountInr
    const hasQuoteField = Object.prototype.hasOwnProperty.call(body, 'quotedAmountInr');
    const resolvedQuote = hasQuoteField
      ? typeof body.quotedAmountInr === 'number' &&
        Number.isFinite(body.quotedAmountInr) &&
        body.quotedAmountInr >= 499
        ? Math.round(body.quotedAmountInr)
        : null
      : (existing.quoted_amount_inr as number | null);

    const adminNotes = (body.adminNotes || '').trim().slice(0, 1000);

    const updatePayload: Record<string, unknown> = {
      status,
      quoted_amount_inr: resolvedQuote,
      admin_notes: adminNotes,
      handled_by: guard.userId,
    };
    if (body.checklist && typeof body.checklist === 'object') {
      updatePayload.checklist = body.checklist;
    }
    if (typeof body.previewUrl === 'string') {
      updatePayload.preview_url = sanitizeHttpUrl(body.previewUrl);
    }
    if (typeof body.liveUrl === 'string') {
      updatePayload.live_url = sanitizeHttpUrl(body.liveUrl);
    }

    let { error } = await guard.admin
      .from('custom_requests')
      .update(updatePayload)
      .eq('id', existing.id);

    if (
      error &&
      (error.message.includes('checklist') ||
        error.message.includes('preview_url') ||
        error.message.includes('live_url'))
    ) {
      const fallbackPayload = {
        status,
        quoted_amount_inr: resolvedQuote,
        admin_notes: adminNotes,
        handled_by: guard.userId,
      };
      const fallbackRes = await guard.admin
        .from('custom_requests')
        .update(fallbackPayload)
        .eq('id', existing.id);
      error = fallbackRes.error;
    }

    if (error) {
      reportServerError(error, { route: '/api/custom-requests', app: 'admin' });
      return NextResponse.json({ error: 'Failed to update custom request.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: 'admin_custom_request_updated',
      entity: 'custom_requests',
      entityId: existing.id,
      meta: { status, quotedAmountInr: resolvedQuote },
    });

    let quoteEmailSent = false;
    if (body.sendQuoteEmail && resolvedQuote) {
      try {
        const cfg = getWebzyPublicConfig();
        await sendTransactionalEmail({
          to: existing.requester_email,
          subject: `Your Webzy Custom Website Quote (${formatInr(resolvedQuote)})`,
          idempotencyKey: `custom_quote_${existing.id}_${resolvedQuote}`,
          text: [
            `Hi ${existing.requester_name},`,
            '',
            `Thanks for sharing your custom ${existing.occasion} website brief with Webzy!`,
            `Estimated quote: ${formatInr(resolvedQuote)} (50% advance to start, 50% upon preview approval).`,
            adminNotes ? `Notes from studio: ${adminNotes}` : '',
            '',
            `Reply to this email or message ${cfg.business.supportWhatsapp} on WhatsApp to confirm and get started.`,
            '',
            `— ${cfg.business.name}`,
          ]
            .filter(Boolean)
            .join('\n'),
        });
        quoteEmailSent = true;
      } catch (mailErr) {
        console.warn('[admin.custom_requests] Non-fatal email transport error:', mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      status,
      quotedAmountInr: resolvedQuote,
      message:
        body.sendQuoteEmail && resolvedQuote
          ? quoteEmailSent
            ? `Updated & quote email sent to ${existing.requester_email}.`
            : `Updated quote (${formatInr(resolvedQuote)}); email delivery warning logged.`
          : 'Custom request updated.',
    });
  } catch (err) {
    reportServerError(err, { route: '/api/custom-requests', app: 'admin' });
    logEvent('error', 'admin.custom_requests_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not update custom request.' }, { status: 500 });
  }
}
