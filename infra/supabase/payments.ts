import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  formatPaiseAsInr,
  getWebzyPublicConfig,
  logEvent,
  VALIDITY_TARGET_DAYS,
  WebzyError,
} from '@webzy/core';
import { type MockStatusStore, resolvePaymentProviderInstance } from '@webzy/core/server';
import { sendTransactionalEmail } from '../email/resend';

export function getCurrentIndianFiscalYear(now: Date = new Date()): string {
  // IST offset (+05:30)
  const ist = new Date(now.getTime() + 330 * 60 * 1000);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth() + 1;
  const startYear = month >= 4 ? year : year - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endShort}`;
}

export function createSupabaseMockStatusStore(admin: SupabaseClient): MockStatusStore {
  return {
    async saveOrder(record) {
      await admin.from('mock_gateway_orders').upsert({
        provider_order_id: record.providerOrderId,
        internal_order_id: record.internalOrderId,
        amount_paise: record.amountPaise,
        currency: 'INR',
        status: 'created',
      });
    },
    async readStatus(providerOrderId) {
      const { data } = await admin
        .from('mock_gateway_orders')
        .select('status, provider_payment_id, amount_paise')
        .eq('provider_order_id', providerOrderId)
        .maybeSingle();

      if (!data) {
        return { status: 'pending' };
      }
      if (data.status === 'captured' || data.status === 'refunded') {
        return {
          status: 'captured',
          providerPaymentId: data.provider_payment_id ?? undefined,
          amountPaise: data.amount_paise ?? undefined,
        };
      }
      if (data.status === 'failed') {
        return {
          status: 'failed',
          providerPaymentId: data.provider_payment_id ?? undefined,
          amountPaise: data.amount_paise ?? undefined,
        };
      }
      return {
        status: 'pending',
        providerPaymentId: data.provider_payment_id ?? undefined,
        amountPaise: data.amount_paise ?? undefined,
      };
    },
  };
}

export async function sendOrderPublishedEmailOnce(
  admin: SupabaseClient,
  params: {
    orderId: string;
    siteSlug: string;
    invoiceNo: string;
  },
): Promise<boolean> {
  // Atomic claim: sets email_sent_at ONLY if still NULL so duplicates send zero extra emails
  const { data: claimedOrder } = await admin
    .from('orders')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', params.orderId)
    .is('email_sent_at', null)
    .select('id, buyer_email, buyer_name, amount_paise, is_test, user_id')
    .maybeSingle();

  if (!claimedOrder) {
    return false;
  }

  let recipientEmail = (claimedOrder.buyer_email as string) || '';
  if (!recipientEmail && claimedOrder.user_id) {
    const { data: prof } = await admin
      .from('profiles')
      .select('email')
      .eq('id', claimedOrder.user_id)
      .maybeSingle();
    recipientEmail = prof?.email || '';
  }

  if (!recipientEmail) {
    return false;
  }

  const cfg = getWebzyPublicConfig();
  const liveUrl = `${cfg.webUrl}/s/${params.siteSlug}`;
  const successUrl = `${cfg.webUrl}/success/${params.orderId}`;
  const invoiceStamp = claimedOrder.is_test ? 'TEST, not a tax invoice' : 'Paid GST-inclusive receipt';

  await sendTransactionalEmail({
    to: recipientEmail,
    subject: `Aapka Webzy link ready hai! (${params.invoiceNo})`,
    idempotencyKey: `order_published_${params.orderId}`,
    text: [
      `Namaste ${claimedOrder.buyer_name || 'Dost'},`,
      '',
      'Aapki Webzy payment confirm ho gayi hai aur aapka link live hai!',
      `Share link: ${liveUrl}`,
      `QR & Edit page: ${successUrl}`,
      '',
      `Invoice No: ${params.invoiceNo} (${invoiceStamp})`,
      `Amount Paid: ${formatPaiseAsInr(claimedOrder.amount_paise)}`,
      '',
      `${cfg.business.name} · ${cfg.business.address}`,
    ].join('\n'),
  });

  await admin.from('audit_log').insert({
    action: 'receipt_email_dispatched',
    entity: 'orders',
    entity_id: params.orderId,
    meta: { invoiceNo: params.invoiceNo, isTest: Boolean(claimedOrder.is_test) },
  });

  return true;
}

export async function settleOrderAndPublish(params: {
  admin: SupabaseClient;
  orderId: string;
  providerPaymentId: string;
  eventId: string;
  amountPaise?: number;
  rawEvent?: Record<string, unknown>;
  autoPublish?: boolean;
}) {
  const cfg = getWebzyPublicConfig();
  const slug = crypto.randomBytes(9).toString('base64url'); // 12 random URL-safe chars

  // Respect server-computed validityDays & isLifetime from the order's pricing_breakdown
  let orderValidityDays = cfg.defaultValidityDays;
  let isLifetime = false;
  try {
    const { data: ordMeta } = await params.admin
      .from('orders')
      .select('pricing_breakdown')
      .eq('id', params.orderId)
      .maybeSingle();
    const breakdown = ordMeta?.pricing_breakdown as
      | { validityDays?: number; isLifetime?: boolean }
      | null
      | undefined;
    if (breakdown?.isLifetime === true) {
      isLifetime = true;
      orderValidityDays = VALIDITY_TARGET_DAYS.lifetime;
    } else if (
      breakdown &&
      typeof breakdown.validityDays === 'number' &&
      breakdown.validityDays >= 1 &&
      breakdown.validityDays <= 36500
    ) {
      orderValidityDays = breakdown.validityDays;
    }
  } catch {
    // Fall back to default validity days
  }

  let { data, error } = await params.admin.rpc('settle_order_payment_tx', {
    p_order_id: params.orderId,
    p_provider_payment_id: params.providerPaymentId,
    p_event_id: params.eventId,
    p_amount_paise: params.amountPaise ?? null,
    p_raw_event: params.rawEvent ?? {},
    p_slug: slug,
    p_fy: getCurrentIndianFiscalYear(),
    p_validity_days: orderValidityDays,
    p_auto_publish: params.autoPublish ?? true,
    p_is_lifetime: isLifetime,
  });

  // Fallback retry without p_is_lifetime if pre-0012 RPC signature is still deployed
  if (
    error &&
    (error.message?.includes('p_is_lifetime') ||
      error.message?.includes('function public.settle_order_payment_tx') ||
      error.code === 'PGRST202')
  ) {
    const fallbackRes = await params.admin.rpc('settle_order_payment_tx', {
      p_order_id: params.orderId,
      p_provider_payment_id: params.providerPaymentId,
      p_event_id: params.eventId,
      p_amount_paise: params.amountPaise ?? null,
      p_raw_event: params.rawEvent ?? {},
      p_slug: slug,
      p_fy: getCurrentIndianFiscalYear(),
      p_validity_days: orderValidityDays,
      p_auto_publish: params.autoPublish ?? true,
    });
    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error || !Array.isArray(data) || data.length === 0) {
    logEvent('error', 'payments.settle_rpc_failed', {
      orderId: params.orderId,
      code: error?.code || 'empty',
    });
    throw new WebzyError('Unable to finalize order settlement right now.', {
      code: 'ORDER_SETTLE_FAILED',
      statusCode: 500,
      retryable: true,
    });
  }

  const row = data[0] as {
    already_settled: boolean;
    order_status: string;
    site_slug: string;
    invoice_no: string;
  };

  if (row.order_status === 'published' && row.site_slug) {
    // Dispatch transactional email non-blocking so checkout/payment redirect returns immediately
    void sendOrderPublishedEmailOnce(params.admin, {
      orderId: params.orderId,
      siteSlug: row.site_slug,
      invoiceNo: row.invoice_no,
    }).catch((mailErr) => {
      logEvent('warn', 'payments.receipt_email_async_failed', {
        orderId: params.orderId,
        message: mailErr instanceof Error ? mailErr.message.slice(0, 120) : 'unknown',
      });
    });
  }

  logEvent('info', 'payments.order_settled', {
    orderId: params.orderId,
    alreadySettled: row.already_settled,
    status: row.order_status,
  });

  return {
    alreadySettled: row.already_settled,
    orderStatus: row.order_status,
    siteSlug: row.site_slug,
    invoiceNo: row.invoice_no,
  };
}

export async function processSignedWebhookEvent(params: {
  admin: SupabaseClient;
  rawBody: string;
  signatureHeader: string | null;
  eventIdHeader?: string | null;
}) {
  const statusStore = createSupabaseMockStatusStore(params.admin);
  const provider = resolvePaymentProviderInstance({ statusStore });
  const signatureOk = provider.verifyWebhook(params.rawBody, params.signatureHeader);

  if (!signatureOk) {
    const invalidEventId = `invalid_${crypto
      .createHash('sha256')
      .update(`${params.rawBody}:${Date.now()}:${crypto.randomUUID()}`)
      .digest('hex')
      .slice(0, 24)}`;

    await params.admin.from('payment_events').insert({
      provider: provider.name,
      event_id: invalidEventId,
      type: 'invalid_signature',
      raw_body: params.rawBody.slice(0, 8000),
      signature_ok: false,
      status: 'ignored',
      error: 'Invalid webhook signature',
    });

    logEvent('warn', 'payments.webhook_invalid_signature', { provider: provider.name });
    return { statusCode: 401, valid: false, duplicate: false };
  }

  const parsed = provider.parseEvent(params.rawBody, params.eventIdHeader);

  // Dedupe via unique event_id
  const { error: insertErr } = await params.admin.from('payment_events').insert({
    provider: provider.name,
    event_id: parsed.eventId,
    type: parsed.eventType,
    raw_body: params.rawBody.slice(0, 16000),
    signature_ok: true,
    status: 'received',
  });

  if (insertErr) {
    if (insertErr.code === '23505') {
      logEvent('info', 'payments.webhook_duplicate_ignored', { eventId: parsed.eventId });
      return { statusCode: 200, valid: true, duplicate: true };
    }
    throw new WebzyError('Failed to persist webhook event.', {
      code: 'WEBHOOK_PERSIST_FAILED',
      statusCode: 500,
      retryable: true,
    });
  }

  try {
    let orderRow: { id: string; status: string; amount_paise: number } | null = null;
    if (parsed.providerOrderId) {
      const { data } = await params.admin
        .from('orders')
        .select('id, status, amount_paise')
        .eq('provider_order_id', parsed.providerOrderId)
        .maybeSingle();
      orderRow = data;
    } else if (parsed.providerPaymentId) {
      const { data: payRow } = await params.admin
        .from('payments')
        .select('order_id')
        .eq('provider_payment_id', parsed.providerPaymentId)
        .maybeSingle();
      if (payRow?.order_id) {
        const { data } = await params.admin
          .from('orders')
          .select('id, status, amount_paise')
          .eq('id', payRow.order_id)
          .maybeSingle();
        orderRow = data;
      }
    }

    if (orderRow) {
      if (parsed.eventType === 'payment.authorized') {
        if (parsed.providerPaymentId) {
          await params.admin.from('payments').upsert(
            {
              order_id: orderRow.id,
              provider_payment_id: parsed.providerPaymentId,
              status: 'authorized',
              amount_paise: parsed.amountPaise ?? orderRow.amount_paise,
              event_id: parsed.eventId,
            },
            { onConflict: 'provider_payment_id', ignoreDuplicates: true },
          );
        }
      } else if (parsed.eventType === 'payment.captured' || parsed.eventType === 'order.paid') {
        await settleOrderAndPublish({
          admin: params.admin,
          orderId: orderRow.id,
          providerPaymentId: parsed.providerPaymentId || `pay_evt_${parsed.eventId}`,
          eventId: parsed.eventId,
          amountPaise: parsed.amountPaise,
          autoPublish: true,
        });
      } else if (parsed.eventType === 'payment.failed') {
        if (parsed.providerPaymentId) {
          await params.admin.from('payments').upsert(
            {
              order_id: orderRow.id,
              provider_payment_id: parsed.providerPaymentId,
              status: 'failed',
              amount_paise: parsed.amountPaise ?? orderRow.amount_paise,
              event_id: parsed.eventId,
            },
            { onConflict: 'provider_payment_id', ignoreDuplicates: true },
          );
        }
        // Monotonic guard: ONLY move to failed if still pre-settlement
        if (orderRow.status === 'payment_pending' || orderRow.status === 'draft') {
          await params.admin
            .from('orders')
            .update({ status: 'failed', failed_at: new Date().toISOString() })
            .eq('id', orderRow.id)
            .in('status', ['draft', 'payment_pending']);
        }
      } else if (parsed.eventType === 'refund.processed' && parsed.providerRefundId) {
        await params.admin
          .from('refunds')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('provider_refund_id', parsed.providerRefundId);
      }
    }

    await params.admin
      .from('payment_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', parsed.eventId);

    return { statusCode: 200, valid: true, duplicate: false, eventType: parsed.eventType };
  } catch (err) {
    await params.admin
      .from('payment_events')
      .update({
        status: 'failed',
        error: err instanceof Error ? err.message.slice(0, 200) : 'processing_error',
      })
      .eq('event_id', parsed.eventId);
    throw err;
  }
}

export async function runPaymentWatchdog(
  admin: SupabaseClient,
  options: { includeRecentForTest?: boolean } = {},
) {
  const statusStore = createSupabaseMockStatusStore(admin);
  const provider = resolvePaymentProviderInstance({ statusStore });
  const cfg = getWebzyPublicConfig();
  const pendingCutoff = options.includeRecentForTest
    ? new Date().toISOString()
    : new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const paidAlertCutoff = options.includeRecentForTest
    ? new Date().toISOString()
    : new Date(Date.now() - 5 * 60 * 1000).toISOString();

  // 1. Recover payment_pending orders older than 10 minutes
  const { data: pendingOrders } = await admin
    .from('orders')
    .select('id, provider_order_id, amount_paise')
    .eq('status', 'payment_pending')
    .lte('created_at', pendingCutoff)
    .limit(50);

  let recoveredCount = 0;
  let failedCount = 0;

  for (const ord of pendingOrders || []) {
    if (!ord.provider_order_id) continue;
    const statusRes = await provider.fetchPaymentStatus(ord.provider_order_id);
    if (statusRes.status === 'captured') {
      await settleOrderAndPublish({
        admin,
        orderId: ord.id,
        providerPaymentId: statusRes.providerPaymentId || `pay_wd_${ord.id}`,
        eventId: `wd_${ord.id}`,
        amountPaise: statusRes.amountPaise ?? ord.amount_paise,
        autoPublish: true,
      });
      recoveredCount++;
    } else if (statusRes.status === 'failed') {
      await admin
        .from('orders')
        .update({ status: 'failed', failed_at: new Date().toISOString() })
        .eq('id', ord.id)
        .eq('status', 'payment_pending');
      failedCount++;
    }
  }

  // 2. Paid-but-unpublished >5 min -> republish & alert admin
  const { data: stuckPaidOrders } = await admin
    .from('orders')
    .select('id, provider_order_id, amount_paise, unpublished_alert_sent_at')
    .eq('status', 'paid')
    .lte('paid_at', paidAlertCutoff)
    .limit(50);

  let alertedCount = 0;
  for (const stuck of stuckPaidOrders || []) {
    if (!stuck.unpublished_alert_sent_at) {
      await admin
        .from('orders')
        .update({ unpublished_alert_sent_at: new Date().toISOString() })
        .eq('id', stuck.id);

      await sendTransactionalEmail({
        to: cfg.business.supportEmail,
        subject: `[ALERT] Paid order unpublished >5m (${stuck.id.slice(0, 8)})`,
        idempotencyKey: `alert_unpublished_${stuck.id}`,
        text: `Order ${stuck.id} has been in 'paid' status without publishing. Watchdog is attempting recovery.`,
      });

      await admin.from('audit_log').insert({
        action: 'alert_paid_unpublished_gt_5m',
        entity: 'orders',
        entity_id: stuck.id,
        meta: { source: 'watchdog' },
      });
      alertedCount++;
    }

    // Attempt recovery publish cleanly
    await settleOrderAndPublish({
      admin,
      orderId: stuck.id,
      providerPaymentId: `pay_wd_repub_${stuck.id}`,
      eventId: `wd_repub_${stuck.id}`,
      amountPaise: stuck.amount_paise,
      autoPublish: true,
    });
  }

  logEvent('info', 'jobs.watchdog.completed', {
    checkedPending: pendingOrders?.length ?? 0,
    recoveredCount,
    failedCount,
    stuckPaidChecked: stuckPaidOrders?.length ?? 0,
    alertedCount,
  });

  return {
    checkedPending: pendingOrders?.length ?? 0,
    recoveredCount,
    failedCount,
    stuckPaidChecked: stuckPaidOrders?.length ?? 0,
    alertedCount,
  };
}
