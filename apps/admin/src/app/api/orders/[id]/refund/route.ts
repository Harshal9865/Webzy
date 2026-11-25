import { NextResponse, type NextRequest } from 'next/server';
import {
  formatPaiseAsInr,
  logEvent,
  WebzyError,
} from '@webzy/core';
import { resolvePaymentProviderInstance } from '@webzy/core/server';
import { sendTransactionalEmail } from '../../../../../../../../infra/email/resend';
import { reportServerError } from '../../../../../../../../infra/sentry/monitor';
import { writeAuditLog } from '../../../../../../../../infra/supabase/auth';
import { createSupabaseMockStatusStore } from '../../../../../../../../infra/supabase/payments';
import { requireVerifiedAdmin } from '../../../../../lib/requireAdmin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireVerifiedAdmin();
    if (!guard.ok) return guard.response;
    const session = { user: { id: guard.userId, email: guard.email } };

    const { id: orderId } = await params;
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const reason = (body.reason || '').trim();
    if (reason.length < 5) {
      throw new WebzyError('A clear refund reason (at least 5 characters) is required.', {
        code: 'REFUND_REASON_REQUIRED',
        statusCode: 400,
      });
    }

    const admin = guard.admin;
    const idempotencyKey = `refund:order:${orderId}:full`;

    // Idempotent second-click check (Acceptance Test #8)
    const { data: existingRefund } = await admin
      .from('refunds')
      .select('id, status, provider_refund_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingRefund && existingRefund.status !== 'failed') {
      return NextResponse.json({
        ok: true,
        idempotent: true,
        providerRefundId: existingRefund.provider_refund_id,
        message: 'Already refunded once — duplicate refund blocked cleanly.',
      });
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, status, amount_paise, buyer_email, buyer_name, invoice_no')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status !== 'paid' && order.status !== 'published') {
      throw new WebzyError(`Order in status '${order.status}' cannot be refunded.`, {
        code: 'REFUND_INVALID_STATE',
        statusCode: 422,
      });
    }

    const { data: paymentRow } = await admin
      .from('payments')
      .select('provider_payment_id')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const providerPaymentId = paymentRow?.provider_payment_id || `pay_mock_manual_${order.id.slice(0, 8)}`;

    // Reserve single refund row (protected by DB BEFORE INSERT trigger guard_refund_insert)
    const { data: refundRow, error: insertErr } = await admin
      .from('refunds')
      .insert({
        order_id: order.id,
        amount_paise: order.amount_paise,
        reason,
        idempotency_key: idempotencyKey,
        status: 'pending',
        decided_by: session.user.id,
      })
      .select('id')
      .single();

    if (insertErr || !refundRow) {
      throw new WebzyError('Refund already exists or exceeded order amount.', {
        code: 'REFUND_CONFLICT',
        statusCode: 409,
      });
    }

    const provider = resolvePaymentProviderInstance({
      statusStore: createSupabaseMockStatusStore(admin),
    });

    let gwRefund: Awaited<ReturnType<typeof provider.refund>>;
    try {
      gwRefund = await provider.refund({
        providerPaymentId,
        amountPaise: order.amount_paise,
        idempotencyKey,
        reason,
      });
    } catch (gatewayErr) {
      // Mark pending refund as failed so future retries are not permanently blocked
      await admin
        .from('refunds')
        .update({
          status: 'failed',
          provider_status: 'gateway_error',
        })
        .eq('id', refundRow.id);
      throw new WebzyError(
        gatewayErr instanceof Error
          ? `Payment gateway refund failed: ${gatewayErr.message.slice(0, 120)}`
          : 'Payment gateway rejected the refund. You can safely retry.',
        { code: 'REFUND_GATEWAY_ERROR', statusCode: 502 },
      );
    }

    await admin
      .from('refunds')
      .update({
        status: gwRefund.status === 'processed' ? 'processed' : 'pending',
        provider_status: gwRefund.status,
        provider_refund_id: gwRefund.providerRefundId,
        processed_at: gwRefund.status === 'processed' ? new Date().toISOString() : null,
      })
      .eq('id', refundRow.id);

    await admin
      .from('orders')
      .update({ status: gwRefund.status === 'processed' ? 'refunded' : 'refund_requested' })
      .eq('id', order.id);

    // Disable site cleanly on full refund
    await admin
      .from('sites')
      .update({ status: 'removed', hidden: true })
      .eq('order_id', order.id);

    if (order.buyer_email) {
      try {
        await sendTransactionalEmail({
          to: order.buyer_email,
          subject: `Refund processed for Order ${order.invoice_no || order.id.slice(0, 8)}`,
          idempotencyKey: `refund_email_${order.id}`,
          text: [
            `Namaste ${order.buyer_name || 'Dost'},`,
            '',
            `Aapke order (${formatPaiseAsInr(order.amount_paise)}) ka refund initiate ho gaya hai.`,
            `Refund ID: ${gwRefund.providerRefundId}`,
            `Reason: ${reason}`,
            '',
            'Banks take 5 to 7 working days to reflect the refund in your account.',
          ].join('\n'),
        });
      } catch (mailErr) {
        console.warn('[admin.refund] Non-fatal email transport error after refund:', mailErr);
      }
    }

    await writeAuditLog({
      actorId: session.user.id,
      action: 'admin_refund_issued',
      entity: 'orders',
      entityId: order.id,
      meta: {
        providerRefundId: gwRefund.providerRefundId,
        amountPaise: order.amount_paise,
      },
    });

    logEvent('info', 'admin.refund.issued', {
      orderId: order.id,
      refundId: gwRefund.providerRefundId,
    });

    return NextResponse.json({
      ok: true,
      idempotent: false,
      providerRefundId: gwRefund.providerRefundId,
      message: 'Refund processed once, site removed, customer notified.',
    });
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    reportServerError(err, { route: '/api/orders/[id]/refund', app: 'admin' });
    logEvent('error', 'admin.refund.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json({ error: 'Unable to process refund right now.' }, { status: 500 });
  }
}
