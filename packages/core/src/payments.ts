import crypto from 'node:crypto';
import { getWebzyPublicConfig, resolveAppEnvironment } from './config';
import { WebzyError } from './logger';
import type {
  CreateGatewayOrderInput,
  GatewayOrderResult,
  ParsedWebhookEvent,
  PaymentProvider,
} from './types';

const LOCAL_DEV_MOCK_WEBHOOK_SECRET = 'webzy-local-mock-secret-2026-keep-safe-32ch';

function resolveMockWebhookSecret(
  env: NodeJS.ProcessEnv = process.env,
  explicitSecret?: string,
): string {
  const explicit = explicitSecret?.trim();
  if (explicit) return explicit;

  const configured = env.MOCK_WEBHOOK_SECRET?.trim();
  if (configured) return configured;

  if (resolveAppEnvironment(env) === 'local') {
    return LOCAL_DEV_MOCK_WEBHOOK_SECRET;
  }

  throw new WebzyError('MOCK_WEBHOOK_SECRET is required outside local development.', {
    code: 'MISSING_WEBHOOK_SECRET',
    statusCode: 500,
    retryable: false,
  });
}

export function parseGatewayEventPayload(
  rawBody: string,
  eventIdHeader?: string | null,
  hmacSecret?: string,
): ParsedWebhookEvent {
  let parsed: {
    id?: string;
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string } };
      order?: { entity?: { id?: string; amount?: number; currency?: string } };
      refund?: { entity?: { id?: string; payment_id?: string; amount?: number; currency?: string } };
    };
  } = {};
  try {
    const rawParsed = JSON.parse(rawBody) as unknown;
    parsed = rawParsed && typeof rawParsed === 'object' ? (rawParsed as typeof parsed) : {};
  } catch {
    const fallbackEventId =
      eventIdHeader?.trim() ||
      (hmacSecret
        ? computeHmacSha256Hex(hmacSecret, rawBody).slice(0, 24)
        : `evt_sha_${crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 20)}`);
    return {
      eventId: fallbackEventId,
      eventType: 'unknown',
      rawBody,
    };
  }

  const rawType = parsed.event || 'unknown';
  const allowedTypes = new Set<ParsedWebhookEvent['eventType']>([
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'order.paid',
    'refund.processed',
    'refund.failed',
  ]);

  const paymentEntity = parsed.payload?.payment?.entity;
  const orderEntity = parsed.payload?.order?.entity;
  const refundEntity = parsed.payload?.refund?.entity;

  return {
    eventId:
      eventIdHeader?.trim() ||
      parsed.id ||
      `evt_sha_${crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 20)}`,
    eventType: allowedTypes.has(rawType as ParsedWebhookEvent['eventType'])
      ? (rawType as ParsedWebhookEvent['eventType'])
      : 'unknown',
    providerOrderId: paymentEntity?.order_id || orderEntity?.id,
    providerPaymentId: paymentEntity?.id || refundEntity?.payment_id,
    providerRefundId: refundEntity?.id,
    amountPaise: paymentEntity?.amount ?? orderEntity?.amount,
    refundAmountPaise: refundEntity?.amount,
    currency: paymentEntity?.currency || orderEntity?.currency || 'INR',
    rawBody,
  };
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

export function computeHmacSha256Hex(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export interface MockStatusStore {
  saveOrder?(record: {
    providerOrderId: string;
    internalOrderId: string;
    amountPaise: number;
  }): Promise<void>;
  readStatus?(providerOrderId: string): Promise<{
    status: 'pending' | 'captured' | 'failed';
    providerPaymentId?: string;
    amountPaise?: number;
  }>;
}

export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'mock' as const;
  private readonly webhookSecret: string;
  private readonly statusStore?: MockStatusStore;

  constructor(options?: {
    webhookSecret?: string;
    statusStore?: MockStatusStore;
    env?: NodeJS.ProcessEnv;
  }) {
    const env = options?.env ?? process.env;
    this.webhookSecret = resolveMockWebhookSecret(env, options?.webhookSecret);
    this.statusStore = options?.statusStore;
  }

  public async createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    const suffix = crypto.randomBytes(8).toString('hex');
    const providerOrderId = `order_mock_${suffix}`;

    if (this.statusStore?.saveOrder) {
      await this.statusStore.saveOrder({
        providerOrderId,
        internalOrderId: input.internalOrderId,
        amountPaise: input.amountPaise,
      });
    }

    return {
      providerOrderId,
      amountPaise: input.amountPaise,
      currency: 'INR',
      raw: { receipt: input.receipt, mock: true },
    };
  }

  public verifyCheckoutSignature(params: {
    providerOrderId: string;
    providerPaymentId: string;
    signature: string;
  }): boolean {
    const expected = computeHmacSha256Hex(
      this.webhookSecret,
      `${params.providerOrderId}|${params.providerPaymentId}`,
    );
    return timingSafeHexEqual(expected, params.signature);
  }

  public verifyWebhook(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) return false;
    const expected = computeHmacSha256Hex(this.webhookSecret, rawBody);
    return timingSafeHexEqual(expected, signatureHeader.trim());
  }

  public parseEvent(rawBody: string, eventIdHeader?: string | null): ParsedWebhookEvent {
    return parseGatewayEventPayload(rawBody, eventIdHeader, this.webhookSecret);
  }

  public async fetchPaymentStatus(providerOrderId: string) {
    if (this.statusStore?.readStatus) {
      const state = await this.statusStore.readStatus(providerOrderId);
      return { ...state, currency: 'INR' };
    }
    return { status: 'pending' as const, currency: 'INR' };
  }

  public async refund(params: {
    providerPaymentId: string;
    amountPaise: number;
    idempotencyKey: string;
    reason: string;
  }) {
    const hash = crypto
      .createHash('sha256')
      .update(`${params.providerPaymentId}:${params.idempotencyKey}`)
      .digest('hex')
      .slice(0, 12);

    return {
      providerRefundId: `rfnd_mock_${hash}`,
      status: 'processed' as const,
    };
  }
}

/**
 * Razorpay adapter stub (Section 10 & Section 27).
 * Switched on later solely via `PAYMENT_PROVIDER=razorpay` + Razorpay env keys.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  public readonly name = 'razorpay' as const;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.keySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';
  }

  public async createOrder(_input: CreateGatewayOrderInput): Promise<GatewayOrderResult> {
    throw new WebzyError('Razorpay live checkout activates in Section 27 Go-Live.', {
      code: 'RAZORPAY_NOT_ENABLED_YET',
      statusCode: 503,
      retryable: false,
    });
  }

  public verifyCheckoutSignature(params: {
    providerOrderId: string;
    providerPaymentId: string;
    signature: string;
  }): boolean {
    if (!this.keySecret) return false;
    const expected = computeHmacSha256Hex(
      this.keySecret,
      `${params.providerOrderId}|${params.providerPaymentId}`,
    );
    return timingSafeHexEqual(expected, params.signature);
  }

  public verifyWebhook(rawBody: string, signatureHeader: string | null): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;
    const expected = computeHmacSha256Hex(this.webhookSecret, rawBody);
    return timingSafeHexEqual(expected, signatureHeader.trim());
  }

  public parseEvent(rawBody: string, eventIdHeader?: string | null): ParsedWebhookEvent {
    return parseGatewayEventPayload(rawBody, eventIdHeader, this.webhookSecret || undefined);
  }

  public async fetchPaymentStatus(_providerOrderId: string): Promise<{
    status: 'pending' | 'captured' | 'failed';
    providerPaymentId?: string;
    amountPaise?: number;
    currency?: string;
  }> {
    throw new WebzyError('Razorpay Orders API status fetch activates in Section 27 Go-Live.', {
      code: 'RAZORPAY_NOT_ENABLED_YET',
      statusCode: 503,
      retryable: false,
    });
  }

  public async refund(): Promise<{ providerRefundId: string; status: 'processed' | 'pending' }> {
    throw new WebzyError('Razorpay Refunds API activates in Section 27 Go-Live.', {
      code: 'RAZORPAY_NOT_ENABLED_YET',
      statusCode: 503,
      retryable: false,
    });
  }
}

export function resolvePaymentProviderInstance(options?: {
  env?: NodeJS.ProcessEnv;
  statusStore?: MockStatusStore;
}): PaymentProvider {
  const env = options?.env ?? process.env;
  const config = getWebzyPublicConfig(env);

  if (config.payButtonDisabled) {
    throw new WebzyError('Mock payments are disabled in production.', {
      code: 'MOCK_DISABLED_IN_PROD',
      statusCode: 403,
      retryable: false,
    });
  }

  if (config.paymentProvider === 'razorpay') {
    return new RazorpayPaymentProvider(env);
  }

  return new MockPaymentProvider({
    webhookSecret: env.MOCK_WEBHOOK_SECRET,
    statusStore: options?.statusStore,
    env,
  });
}
