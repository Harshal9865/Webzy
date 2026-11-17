import { NextResponse } from 'next/server';
import { formatInr, getWebzyPublicConfig, logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
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

    const status =
      typeof body.status === 'string' && ALLOWED_STATUSES.has(body.status)
        ? body.status
        : 'reviewing';
    const quotedAmountInr =
      typeof body.quotedAmountInr === 'number' && Number.isFinite(body.quotedAmountInr) && body.quotedAmountInr >= 999
        ? Math.round(body.quotedAmountInr)
        : null;
    const adminNotes = (body.adminNotes || '').trim().slice(0, 1000);

    const { data: existing } = await guard.admin
      .from('custom_requests')
      .select('id, requester_name, requester_email, occasion')
      .eq('id', requestId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Custom request not found.' }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {
      status,
      quoted_amount_inr: quotedAmountInr,
      admin_notes: adminNotes,
      handled_by: guard.userId,
    };
    if (body.checklist && typeof body.checklist === 'object') {
      updatePayload.checklist = body.checklist;
    }
    if (typeof body.previewUrl === 'string') {
      updatePayload.preview_url = body.previewUrl.trim();
    }
    if (typeof body.liveUrl === 'string') {
      updatePayload.live_url = body.liveUrl.trim();
    }

    let { error } = await guard.admin
      .from('custom_requests')
      .update(updatePayload)
      .eq('id', existing.id);

    // Graceful fallback if columns don't exist yet on unmigrated database
    if (error && (error.message.includes('checklist') || error.message.includes('preview_url') || error.message.includes('live_url'))) {
      const fallbackPayload = {
        status,
        quoted_amount_inr: quotedAmountInr,
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
      return NextResponse.json({ error: 'Failed to update custom request.' }, { status: 500 });
    }

    await writeAuditLog({
      actorId: guard.userId,
      action: 'admin_custom_request_updated',
      entity: 'custom_requests',
      entityId: existing.id,
      meta: { status, quotedAmountInr },
    });

    if (body.sendQuoteEmail && quotedAmountInr) {
      const cfg = getWebzyPublicConfig();
      await sendTransactionalEmail({
        to: existing.requester_email,
        subject: `Your Webzy Custom Website Quote (${formatInr(quotedAmountInr)})`,
        idempotencyKey: `custom_quote_${existing.id}_${quotedAmountInr}`,
        text: [
          `Hi ${existing.requester_name},`,
          '',
          `Thanks for sharing your custom ${existing.occasion} website brief with Webzy!`,
          `Estimated quote: ${formatInr(quotedAmountInr)} (50% advance to start, 50% upon preview approval).`,
          adminNotes ? `Notes from studio: ${adminNotes}` : '',
          '',
          `Reply to this email or message ${cfg.business.supportWhatsapp} on WhatsApp to confirm and get started.`,
          '',
          `— ${cfg.business.name}`,
        ]
          .filter(Boolean)
          .join('\n'),
      });
    }

    return NextResponse.json({
      ok: true,
      message: body.sendQuoteEmail && quotedAmountInr
        ? `Updated & quote email sent to ${existing.requester_email}.`
        : 'Custom request updated.',
    });
  } catch (err) {
    logEvent('error', 'admin.custom_requests_error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Could not update custom request.' }, { status: 500 });
  }
}
