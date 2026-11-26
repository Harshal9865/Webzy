import { NextResponse, type NextRequest } from 'next/server';
import { detectScamPatterns, getWebzyPublicConfig, logEvent } from '@webzy/core';
import { sendTransactionalEmail } from '../../../../../../infra/email/resend';
import { guardMutationRequest, verifyTurnstileIfConfigured } from '../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { getCustomOrderCapacity } from '../../../../../../infra/supabase/capacity';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

const ALLOWED_OCCASIONS = new Set(['wedding', 'birthday', 'anniversary', 'family', 'business', 'other']);
const ALLOWED_BUDGETS = new Set(['1999', '3499', '5999', '2999-4999', '5000-9999', '10000+']);

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'custom_requests',
      maxHits: 6,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Database is not configured yet.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      occasion?: string;
      budgetTier?: string;
      targetDate?: string;
      referenceUrl?: string;
      brief?: string;
      turnstileToken?: string;
    };

    const turnstileOk = await verifyTurnstileIfConfigured(request, body.turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Security check could not be completed. Please refresh and try again.' },
        { status: 403 },
      );
    }

    const name = (body.name || '').trim().slice(0, 80);
    const email = (body.email || '').trim().toLowerCase().slice(0, 120);
    const phone = (body.phone || '').trim().slice(0, 20);
    const occasion = typeof body.occasion === 'string' && ALLOWED_OCCASIONS.has(body.occasion)
      ? body.occasion
      : 'other';
    const budgetTier = typeof body.budgetTier === 'string' && ALLOWED_BUDGETS.has(body.budgetTier)
      ? body.budgetTier
      : '2999-4999';
    const rawBrief = (body.brief || '').trim().slice(0, 1000);
    const referenceUrl = (body.referenceUrl || '').trim().slice(0, 300);
    const brief = referenceUrl
      ? `${rawBrief}\n\nReference Link: ${referenceUrl}`.slice(0, 1350)
      : rawBrief;
    const targetDate =
      typeof body.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)
        ? body.targetDate
        : null;

    if (name.length < 2 || !email.includes('@') || rawBrief.length < 15) {
      return NextResponse.json(
        { error: 'Please fill your name, a valid email, and a short brief (at least 15 characters).' },
        { status: 400 },
      );
    }

    // Custom studio requests naturally include reference URLs, phone numbers, or email addresses.
    // Only block explicit scam/phishing phrases or bank IFSC harvesting patterns.
    const SCAM_PHRASE_RE =
      /\b(?:kyc\s*expired|pan\s*card\s*block|lottery\s*winner|claim\s*your\s*prize|instant\s*loan\s*approval|crypto\s*airdrop|send\s*otp|verify\s*bank\s*account)\b/i;
    const scamCheck = detectScamPatterns(`${name} ${rawBrief}`, { allowPhone: true });
    if (SCAM_PHRASE_RE.test(`${name} ${rawBrief}`) || scamCheck.violation === 'ifsc') {
      return NextResponse.json(
        { error: 'Your brief contains restricted promotional or banking phrases. Please describe your event in plain text.' },
        { status: 400 },
      );
    }

    const session = await getAuthSessionState();
    const admin = createSupabaseAdminClient();

    const capacityCategory = occasion === 'wedding' ? 'wedding' : 'studio';
    const capacity = await getCustomOrderCapacity(admin);
    const slot = capacity[capacityCategory];
    if (!slot.acceptingOrders) {
      return NextResponse.json(
        {
          error: slot.capacityMessage,
          code: 'CAPACITY_FULL',
          category: capacityCategory,
          capacity: slot,
        },
        { status: 429 },
      );
    }

    const { data: created, error } = await admin
      .from('custom_requests')
      .insert({
        user_id: session.user?.id ?? null,
        requester_name: name,
        requester_email: email,
        requester_phone: phone,
        occasion,
        budget_tier: budgetTier,
        target_date: targetDate,
        brief,
        status: 'new',
      })
      .select('id')
      .single();

    if (error || !created) {
      logEvent('error', 'web.custom_request.insert_failed', { code: error?.code || 'unknown' });
      return NextResponse.json({ error: 'Could not save your request right now.' }, { status: 500 });
    }

    await admin.from('audit_log').insert({
      actor: session.user?.id ?? null,
      action: 'custom_request_submitted',
      entity: 'custom_requests',
      entity_id: created.id,
      meta: { occasion, budgetTier },
    });

    const cfg = getWebzyPublicConfig();
    const founderEmail =
      process.env.SEED_ADMIN_EMAIL?.trim() ||
      process.env.SUPPORT_EMAIL?.trim() ||
      cfg.business.supportEmail;
    await sendTransactionalEmail({
      to: founderEmail,
      subject: `[Webzy Custom Request] ${occasion} (${budgetTier}) from ${name}`,
      idempotencyKey: `custom_req_alert_${created.id}`,
      text: [
        `New Custom Website Request (#${created.id.slice(0, 8)})`,
        `From: ${name} <${email}> ${phone ? `(${phone})` : ''}`,
        `Occasion: ${occasion} | Budget: ₹${budgetTier} | Target Date: ${targetDate || 'Flexible'}`,
        '',
        'Brief:',
        brief,
      ].join('\n'),
    });

    return NextResponse.json({
      ok: true,
      requestId: created.id,
    });
  } catch (err) {
    logEvent('warn', 'web.custom_request.error', {
      message: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    });
    return NextResponse.json({ error: 'Unable to submit request right now.' }, { status: 500 });
  }
}
