import { NextResponse, type NextRequest } from 'next/server';
import { logEvent, WebzyError } from '@webzy/core';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { processSignedWebhookEvent } from '../../../../../../../infra/supabase/payments';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
    }

    const rawBody = await request.text();
    const signatureHeader =
      request.headers.get('x-webzy-mock-signature') ||
      request.headers.get('x-razorpay-signature');
    const eventIdHeader =
      request.headers.get('x-webzy-event-id') || request.headers.get('x-razorpay-event-id');

    const admin = createSupabaseAdminClient();
    const result = await processSignedWebhookEvent({
      admin,
      rawBody,
      signatureHeader,
      eventIdHeader,
    });

    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      eventType: result.eventType,
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    logEvent('error', 'web.payments.webhook_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Webhook processing error.' }, { status: 500 });
  }
}
