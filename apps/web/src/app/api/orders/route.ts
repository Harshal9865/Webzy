import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  computeOrderPricingPaise,
  getWebzyPublicConfig,
  logEvent,
  validateCheckoutConsent,
  validateProfileInput,
  WebzyError,
} from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { getAuthSessionState } from '../../../../../../infra/supabase/auth';
import { getSupabaseEnv } from '../../../../../../infra/supabase/env';
import {
  createSupabaseMockStatusStore,
} from '../../../../../../infra/supabase/payments';
import { resolvePaymentProviderInstance } from '@webzy/core/server';
import { guardMutationRequest } from '../../../../../../infra/security/requestGuard';
import { createSupabaseAdminClient } from '../../../../../../infra/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'order_create',
      maxHits: 20,
      windowSeconds: 60,
    });
    if (guard) return guard;

    if (!getSupabaseEnv().adminConfigured) {
      return NextResponse.json(
        { error: 'Supabase is not configured yet.', retryable: false },
        { status: 503 },
      );
    }

    const cfg = getWebzyPublicConfig();
    if (cfg.payButtonDisabled) {
      return NextResponse.json(
        { error: 'Payments are temporarily paused in this environment.', retryable: false },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      draftToken?: string;
      addons?: string[];
      secretPin?: string;
      fullName?: string;
      phone?: string;
      idempotencyKey?: string;
      consent?: {
        ageOrParentConfirmed?: boolean;
        termsAndRefundAccepted?: boolean;
        photoPermissionConfirmed?: boolean;
      };
    };

    if (!body.draftToken || !/^[A-Za-z0-9_-]{24,128}$/.test(body.draftToken)) {
      throw new WebzyError('Invalid or missing draft session.', {
        code: 'ORDER_INVALID_DRAFT',
        statusCode: 400,
      });
    }

    const admin = createSupabaseAdminClient();
    const tokenHash = crypto.createHash('sha256').update(body.draftToken).digest('hex');

    // Run session auth and draft lookup in parallel to shave a full network round-trip from checkout
    const [session, { data: draft }] = await Promise.all([
      getAuthSessionState(),
      admin
        .from('drafts')
        .select('id, theme_id, theme_version_id, user_id, content_json')
        .eq('draft_token_hash', tokenHash)
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
    ]);

    if (!session.user) {
      return NextResponse.json(
        { error: 'Please sign in via magic link before paying.', code: 'AUTH_REQUIRED' },
        { status: 401 },
      );
    }
    if (session.profile?.is_banned) {
      return NextResponse.json(
        { error: 'Account access restricted. Contact support.' },
        { status: 403 },
      );
    }

    if (!draft) {
      throw new WebzyError('Your draft expired or could not be found.', {
        code: 'DRAFT_NOT_FOUND',
        statusCode: 404,
      });
    }

    if (draft.user_id && draft.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'This draft belongs to another account.', code: 'DRAFT_OWNERSHIP_CONFLICT' },
        { status: 403 },
      );
    }

    const theme = getThemeById(draft.theme_id, { includeMaanJao: cfg.flags.maanJaoTheme });
    if (!theme) {
      throw new WebzyError('Selected theme is unavailable.', {
        code: 'THEME_UNAVAILABLE',
        statusCode: 404,
      });
    }

    // Ensure profile details & legal consents (Section 9)
    const cleanedProfile = validateProfileInput({
      fullName: body.fullName ?? session.profile?.full_name,
      phone: body.phone ?? session.profile?.phone ?? '',
    });

    // Server-computed pricing ONLY (ignores any price passed by browser - Section 10)
    const baseValidityDays = cfg.defaultValidityDays;
    const pricing = computeOrderPricingPaise({
      basePriceInr: theme.price.base,
      allowedAddons: theme.price.addons,
      selectedAddons: body.addons,
      defaultValidityDays: baseValidityDays,
    });

    const baseContentSnapshot =
      draft.content_json && typeof draft.content_json === 'object'
        ? { ...(draft.content_json as Record<string, unknown>) }
        : {};

    if (pricing.validAddonIds.includes('pin')) {
      const cleanPin = typeof body.secretPin === 'string' ? body.secretPin.replace(/\D/g, '') : '';
      if (cleanPin.length !== 4) {
        throw new WebzyError('Please enter a 4-digit Secret PIN to enable PIN Lock.', {
          code: 'ORDER_INVALID_PIN',
          statusCode: 400,
        });
      }
      baseContentSnapshot.pinSalt = draft.id;
      baseContentSnapshot.secretPinHash = crypto
        .createHash('sha256')
        .update(`webzy-pin:${draft.id}:${cleanPin}`)
        .digest('hex');
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(baseContentSnapshot))
      .digest('hex')
      .slice(0, 10);

    const idempotencyKey =
      body.idempotencyKey && body.idempotencyKey.length >= 8
        ? body.idempotencyKey.slice(0, 80)
        : `ord_${draft.id}_${crypto
            .createHash('sha256')
            .update(`${pricing.validAddonIds.join(',')}:${contentHash}`)
            .digest('hex')
            .slice(0, 12)}`;

    // Run independent pre-order lookups in parallel
    const [{ count: photoCount }, { data: existingOrder }] = await Promise.all([
      admin
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('draft_id', draft.id)
        .eq('status', 'ready')
        .is('deleted_at', null),
      admin
        .from('orders')
        .select('id, status, provider_order_id, amount_paise')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle(),
    ]);

    if (existingOrder && existingOrder.status !== 'failed') {
      const nextUrl =
        existingOrder.status === 'published' || existingOrder.status === 'paid'
          ? `/success/${existingOrder.id}`
          : `/mock-pay/${existingOrder.id}`;
      return NextResponse.json({
        orderId: existingOrder.id,
        providerOrderId: existingOrder.provider_order_id,
        amountPaise: existingOrder.amount_paise,
        redirectUrl: nextUrl,
        idempotent: true,
      });
    }

    const effectiveIdempotencyKey =
      existingOrder && existingOrder.status === 'failed'
        ? `${idempotencyKey}_r${Date.now().toString(36)}`
        : idempotencyKey;

    const consentRecords = validateCheckoutConsent({
      ageOrParentConfirmed: Boolean(body.consent?.ageOrParentConfirmed),
      termsAndRefundAccepted: Boolean(body.consent?.termsAndRefundAccepted),
      photoPermissionConfirmed: Boolean(body.consent?.photoPermissionConfirmed),
      hasPhotos: (photoCount ?? 0) > 0,
    });

    const statusStore = createSupabaseMockStatusStore(admin);
    const provider = resolvePaymentProviderInstance({ statusStore });
    const internalOrderId = crypto.randomUUID();

    // Claim anonymous draft, update buyer profile snapshot, and create gateway order in parallel
    const draftClaimPromise = !draft.user_id
      ? admin
          .from('drafts')
          .update({ user_id: session.user.id, claimed_at: new Date().toISOString() })
          .eq('id', draft.id)
          .is('user_id', null)
          .select('id')
          .maybeSingle()
      : Promise.resolve({ data: { id: draft.id }, error: null });

    const [claimedRes, , gwOrder] = await Promise.all([
      draftClaimPromise,
      admin
        .from('profiles')
        .update({
          full_name: cleanedProfile.fullName,
          phone: cleanedProfile.phone,
        })
        .eq('id', session.user.id),
      provider.createOrder({
        internalOrderId,
        amountPaise: pricing.totalPaise,
        currency: 'INR',
        receipt: `rcpt_${internalOrderId.slice(0, 12)}`,
      }),
    ]);

    if (!draft.user_id && (claimedRes.error || !claimedRes.data)) {
      return NextResponse.json(
        { error: 'This draft belongs to another account.', code: 'DRAFT_OWNERSHIP_CONFLICT' },
        { status: 403 },
      );
    }

    const { error: orderErr } = await admin.from('orders').insert({
      id: internalOrderId,
      user_id: session.user.id,
      draft_id: draft.id,
      amount_paise: pricing.totalPaise,
      subtotal_paise: pricing.subtotalPaise,
      discount_paise: pricing.discountPaise,
      addons_json: pricing.validAddonIds,
      pricing_breakdown: pricing,
      currency: 'INR',
      status: 'payment_pending',
      provider: provider.name,
      provider_order_id: gwOrder.providerOrderId,
      content_snapshot: baseContentSnapshot,
      theme_version_id: draft.theme_version_id,
      fee_estimate_paise: pricing.feeEstimatePaise,
      is_test: cfg.isMockPaymentMode,
      idempotency_key: effectiveIdempotencyKey,
      buyer_name: cleanedProfile.fullName,
      buyer_email: session.user.email || session.profile?.email || '',
      buyer_phone: cleanedProfile.phone,
    });

    if (orderErr) {
      logEvent('error', 'web.orders.insert_failed', { dbCode: orderErr.code || 'unknown' });
      throw new WebzyError('Failed to create order. Please retry.', {
        code: 'ORDER_INSERT_FAILED',
        statusCode: 500,
        retryable: true,
      });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 200);

    await admin.from('consent_log').insert(
      consentRecords.map((c) => ({
        user_id: session.user!.id,
        order_id: internalOrderId,
        policy: c.policy,
        version: c.version,
        ip,
        user_agent: userAgent,
      })),
    );

    logEvent('info', 'web.orders.created', {
      orderId: internalOrderId,
      amountPaise: pricing.totalPaise,
      provider: provider.name,
    });

    return NextResponse.json(
      {
        orderId: internalOrderId,
        providerOrderId: gwOrder.providerOrderId,
        amountPaise: pricing.totalPaise,
        redirectUrl: `/mock-pay/${internalOrderId}`,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof WebzyError) {
      return NextResponse.json(
        { error: err.message, code: err.code, retryable: err.retryable },
        { status: err.statusCode },
      );
    }
    logEvent('error', 'web.orders.post_exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to start checkout right now. Please retry.', retryable: true },
      { status: 500 },
    );
  }
}
