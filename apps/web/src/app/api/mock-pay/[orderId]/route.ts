import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getWebzyPublicConfig, logEvent, WebzyError } from '@webzy/core';
import { computeHmacSha256Hex } from '@webzy/core/server';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { processSignedWebhookEvent } from '../../../../../../../infra/supabase/payments';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

type MockAction =
  | 'success'
  | 'fail'
  | 'close_tab_paid'
  | 'duplicate_success'
  | 'delayed_success'
  | 'out_of_order_late_fail'
  | 'paid_only_for_watchdog_alert'
  | 'wrong_signature';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'mock_pay',
      maxHits: 30,
      windowSeconds: 60,
    });
    if (guard) return guard;

    const cfg = getWebzyPublicConfig();
    if (!cfg.isMockPaymentMode || cfg.payButtonDisabled) {
      return NextResponse.json({ error: 'Mock gateway disabled.' }, { status: 403 });
    }
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Login required.' }, { status: 401 });
    }

    const { orderId } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: MockAction };
    const action = body.action || 'success';

    const admin = createSupabaseAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, provider_order_id, amount_paise')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!order || !order.provider_order_id) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const secret =
      process.env.MOCK_WEBHOOK_SECRET?.trim() || 'webzy-local-mock-secret-2026-keep-safe-32ch';
    const paymentId = `pay_mock_${crypto.randomBytes(6).toString('hex')}`;

    const fireSignedWebhook = async (
      eventName: string,
      eventId: string,
      overrideSignature?: string,
    ) => {
      const payload = JSON.stringify({
        id: eventId,
        event: eventName,
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: order.provider_order_id,
              amount: order.amount_paise,
              currency: 'INR',
            },
          },
        },
      });
      const sig = overrideSignature ?? computeHmacSha256Hex(secret, payload);
      return processSignedWebhookEvent({
        admin,
        rawBody: payload,
        signatureHeader: sig,
        eventIdHeader: eventId,
      });
    };

    if (action === 'wrong_signature') {
      const res = await fireSignedWebhook(
        'payment.captured',
        `evt_bad_${Date.now()}`,
        'deadbeef-wrong-signature',
      );
      return NextResponse.json({
        ok: false,
        rejectedSignature: !res.valid,
        message: 'Wrong signature was rejected and logged in payment_events with zero order change.',
      });
    }

    if (action === 'fail') {
      await admin
        .from('mock_gateway_orders')
        .update({ status: 'failed', provider_payment_id: paymentId, updated_at: new Date().toISOString() })
        .eq('provider_order_id', order.provider_order_id);

      await fireSignedWebhook('payment.failed', `evt_fail_${crypto.randomUUID()}`);
      return NextResponse.json({
        ok: true,
        status: 'failed',
        message: 'Simulated payment failure recorded. No site created.',
      });
    }

    if (action === 'close_tab_paid') {
      // Gateway captured payment, but customer closed tab BEFORE webhook or return verify!
      await admin
        .from('mock_gateway_orders')
        .update({
          status: 'captured',
          provider_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('provider_order_id', order.provider_order_id);

      logEvent('info', 'mock_pay.closed_tab_simulated', { orderId: order.id });
      return NextResponse.json({
        ok: true,
        status: 'payment_pending',
        message:
          'Gateway captured money while order stays pending. Run Watchdog to recover automatically!',
      });
    }

    if (action === 'paid_only_for_watchdog_alert') {
      // Marks order as `paid` > 6 mins ago without creating a site (tests Acceptance Test #9)
      const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
      await admin
        .from('orders')
        .update({ status: 'paid', paid_at: sixMinAgo })
        .eq('id', order.id);
      return NextResponse.json({
        ok: true,
        status: 'paid',
        message: 'Simulated paid-but-unpublished (>5m) state. Run Watchdog to trigger Admin alert & publish.',
      });
    }

    // Success / duplicate_success / delayed_success / out_of_order_late_fail
    await admin
      .from('mock_gateway_orders')
      .update({
        status: 'captured',
        provider_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_order_id', order.provider_order_id);

    const stableEventId = `evt_cap_${order.id}`;
    await fireSignedWebhook('payment.captured', stableEventId);

    if (action === 'duplicate_success') {
      const dupRes = await fireSignedWebhook('payment.captured', stableEventId);
      return NextResponse.json({
        ok: true,
        duplicateIgnored: dupRes.duplicate,
        redirectUrl: `/success/${order.id}`,
        message: 'Duplicate webhook ignored cleanly — only 1 site & 1 email created.',
      });
    }

    if (action === 'out_of_order_late_fail') {
      await fireSignedWebhook('payment.failed', `evt_late_fail_${crypto.randomUUID()}`);
      return NextResponse.json({
        ok: true,
        redirectUrl: `/success/${order.id}`,
        message: 'Late payment.failed arrived after capture — settled order stayed published.',
      });
    }

    return NextResponse.json({
      ok: true,
      redirectUrl: `/success/${order.id}`,
      message: 'Mock UPI payment confirmed and site published!',
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    logEvent('error', 'web.mock_pay.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Mock simulation failed. Retry.' }, { status: 500 });
  }
}
