import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, WebzyError } from '@webzy/core';
import { resolvePaymentProviderInstance } from '@webzy/core/server';
import { getAuthSessionState } from '../../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import {
  createSupabaseMockStatusStore,
  settleOrderAndPublish,
} from '../../../../../../../infra/supabase/payments';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'payment_verify',
      maxHits: 20,
      windowSeconds: 60,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const session = await getAuthSessionState();
    if (!session.user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      orderId?: string;
      providerOrderId?: string;
      providerPaymentId?: string;
      signature?: string;
    };

    if (!body.orderId || !body.providerOrderId || !body.providerPaymentId || !body.signature) {
      throw new WebzyError('Missing payment verification fields.', {
        code: 'VERIFY_MISSING_FIELDS',
        statusCode: 400,
      });
    }

    const admin = createSupabaseAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, provider_order_id, amount_paise')
      .eq('id', body.orderId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!order || order.provider_order_id !== body.providerOrderId) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const provider = resolvePaymentProviderInstance({
      statusStore: createSupabaseMockStatusStore(admin),
    });
    const sigOk = provider.verifyCheckoutSignature({
      providerOrderId: body.providerOrderId,
      providerPaymentId: body.providerPaymentId,
      signature: body.signature,
    });

    if (!sigOk) {
      logEvent('warn', 'web.payments.verify_bad_signature', { orderId: order.id });
      return NextResponse.json({ error: 'Payment signature mismatch.' }, { status: 400 });
    }

    const settled = await settleOrderAndPublish({
      admin,
      orderId: order.id,
      providerPaymentId: body.providerPaymentId,
      eventId: `verify_${body.providerPaymentId}`,
      amountPaise: order.amount_paise,
      autoPublish: true,
    });

    return NextResponse.json({
      ok: true,
      ...settled,
      redirectUrl: `/success/${order.id}`,
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    logEvent('error', 'web.payments.verify_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Verification failed. Retry.' }, { status: 500 });
  }
}
