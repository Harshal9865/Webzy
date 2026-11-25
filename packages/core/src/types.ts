export type AppEnvironment = 'local' | 'staging' | 'production';
export type PaymentProviderName = 'mock' | 'razorpay';
export type CoreLanguageCode = 'hinglish' | 'hi' | 'en';
export type RegionalLanguageCode = 'gu' | 'mr' | 'pa' | 'bn' | 'ta' | 'te' | 'kn';
export type LanguageCode = CoreLanguageCode | RegionalLanguageCode;
export type LocalizedText = Record<CoreLanguageCode, string> &
  Partial<Record<RegionalLanguageCode, string>>;

export const ORDER_STATES = [
  'draft',
  'payment_pending',
  'paid',
  'published',
  'failed',
  'refund_requested',
  'refunded',
  'partially_refunded',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATES)[number];

export const SITE_STATES = ['scheduled', 'live', 'hidden', 'expired', 'removed'] as const;
export type SiteStatus = (typeof SITE_STATES)[number];

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  if (from === 'refunded' || from === 'cancelled') return false;
  if (
    (from === 'paid' || from === 'published' || from === 'refund_requested' || from === 'partially_refunded') &&
    (to === 'draft' || to === 'payment_pending' || to === 'failed')
  ) {
    return false;
  }
  return true;
}

export interface CreateGatewayOrderInput {
  internalOrderId: string;
  amountPaise: number;
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: 'INR';
  raw?: unknown;
}

export interface ParsedWebhookEvent {
  eventId: string;
  eventType:
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'order.paid'
    | 'refund.processed'
    | 'refund.failed'
    | 'unknown';
  providerOrderId?: string;
  providerPaymentId?: string;
  providerRefundId?: string;
  amountPaise?: number;
  refundAmountPaise?: number;
  currency?: string;
  rawBody: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createOrder(input: CreateGatewayOrderInput): Promise<GatewayOrderResult>;
  verifyCheckoutSignature(params: {
    providerOrderId: string;
    providerPaymentId: string;
    signature: string;
  }): boolean;
  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean;
  parseEvent(rawBody: string, eventIdHeader?: string | null): ParsedWebhookEvent;
  fetchPaymentStatus(providerOrderId: string): Promise<{
    status: 'pending' | 'captured' | 'failed';
    providerPaymentId?: string;
    amountPaise?: number;
    currency?: string;
  }>;
  refund(params: {
    providerPaymentId: string;
    amountPaise: number;
    idempotencyKey: string;
    reason: string;
  }): Promise<{ providerRefundId: string; status: 'processed' | 'pending' }>;
}
