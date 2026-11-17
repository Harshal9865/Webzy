import { describe, expect, it } from 'vitest';
import { computeHmacSha256Hex, MockPaymentProvider } from '../server';

describe('@webzy/core MockPaymentProvider & webhook signatures', () => {
  it('signs and verifies checkout + raw webhook HMAC SHA-256 signatures', async () => {
    const secret = 'test-webhook-secret-32-chars-minimum';
    const provider = new MockPaymentProvider({ webhookSecret: secret });

    const gwOrder = await provider.createOrder({
      internalOrderId: 'ord_1',
      amountPaise: 9900,
      currency: 'INR',
      receipt: 'rcpt_1',
    });
    expect(gwOrder.providerOrderId.startsWith('order_mock_')).toBe(true);

    const paymentId = 'pay_mock_12345';
    const sig = computeHmacSha256Hex(secret, `${gwOrder.providerOrderId}|${paymentId}`);
    expect(
      provider.verifyCheckoutSignature({
        providerOrderId: gwOrder.providerOrderId,
        providerPaymentId: paymentId,
        signature: sig,
      }),
    ).toBe(true);
    expect(
      provider.verifyCheckoutSignature({
        providerOrderId: gwOrder.providerOrderId,
        providerPaymentId: paymentId,
        signature: 'wrong-signature',
      }),
    ).toBe(false);

    const rawBody = JSON.stringify({
      id: 'evt_mock_001',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: gwOrder.providerOrderId,
            amount: 9900,
            currency: 'INR',
          },
        },
      },
    });
    const webhookSig = computeHmacSha256Hex(secret, rawBody);
    expect(provider.verifyWebhook(rawBody, webhookSig)).toBe(true);
    expect(provider.verifyWebhook(rawBody, 'bad')).toBe(false);

    const parsed = provider.parseEvent(rawBody, null);
    expect(parsed.eventType).toBe('payment.captured');
    expect(parsed.providerOrderId).toBe(gwOrder.providerOrderId);
    expect(parsed.amountPaise).toBe(9900);
  });
});
