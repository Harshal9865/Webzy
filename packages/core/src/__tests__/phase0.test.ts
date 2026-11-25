import { describe, expect, it } from 'vitest';
import {
  getWebzyPublicConfig,
  resolveAppEnvironment,
  WEBZY_COLORS,
  WebzyError,
} from '../index';
import {
  MockPaymentProvider,
  RazorpayPaymentProvider,
  resolvePaymentProviderInstance,
} from '../server';

describe('Phase 0 Core Config & Guardrails', () => {
  it('uses safe defaults matching Section 26 open-question config', () => {
    const cfg = getWebzyPublicConfig({ NODE_ENV: 'development' } as NodeJS.ProcessEnv);
    expect(cfg.appEnv).toBe('local');
    expect(cfg.paymentProvider).toBe('mock');
    expect(cfg.isMockPaymentMode).toBe(true);
    expect(cfg.payButtonDisabled).toBe(false);
    expect(cfg.defaultValidityDays).toBe(7);
    expect(cfg.gstRegistered).toBe(false);
    expect(cfg.flags.maanJaoTheme).toBe(false);
    expect(cfg.flags.openedAlert).toBe(false);
    expect(WEBZY_COLORS.primary).toBe('#E11D63');
  });

  it('disables pay button in production when mock provider is active without ALLOW_MOCK_IN_PROD', () => {
    const blocked = getWebzyPublicConfig({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_ENV: 'production',
      PAYMENT_PROVIDER: 'mock',
      ALLOW_MOCK_IN_PROD: 'false',
    } as NodeJS.ProcessEnv);
    expect(blocked.payButtonDisabled).toBe(true);

    const allowed = getWebzyPublicConfig({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_ENV: 'production',
      PAYMENT_PROVIDER: 'mock',
      ALLOW_MOCK_IN_PROD: 'true',
    } as NodeJS.ProcessEnv);
    expect(allowed.payButtonDisabled).toBe(false);
  });

  it('constructs retryable structured WebzyError', () => {
    const err = new WebzyError('Connection timed out', {
      code: 'SUPABASE_TIMEOUT',
      statusCode: 503,
      retryable: true,
    });
    expect(err.code).toBe('SUPABASE_TIMEOUT');
    expect(err.retryable).toBe(true);
    expect(err.statusCode).toBe(503);
  });

  it('resolves app environment cleanly across NODE_ENV and NEXT_PUBLIC_APP_ENV', () => {
    expect(resolveAppEnvironment({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBe('local');
    expect(resolveAppEnvironment({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe('production');
    expect(
      resolveAppEnvironment({
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_ENV: 'staging',
      } as NodeJS.ProcessEnv),
    ).toBe('staging');
    expect(
      resolveAppEnvironment({
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_ENV: 'development',
      } as NodeJS.ProcessEnv),
    ).toBe('production');
  });

  it('fails closed when MOCK_WEBHOOK_SECRET is omitted in staging or production', () => {
    expect(() =>
      resolvePaymentProviderInstance({
        env: {
          NODE_ENV: 'production',
          NEXT_PUBLIC_APP_ENV: 'staging',
          PAYMENT_PROVIDER: 'mock',
        } as NodeJS.ProcessEnv,
      }),
    ).toThrowError(WebzyError);

    try {
      resolvePaymentProviderInstance({
        env: {
          NODE_ENV: 'production',
          PAYMENT_PROVIDER: 'mock',
          ALLOW_MOCK_IN_PROD: 'true',
        } as NodeJS.ProcessEnv,
      });
      expect.unreachable('Expected MISSING_WEBHOOK_SECRET WebzyError');
    } catch (err) {
      expect(err).toBeInstanceOf(WebzyError);
      expect((err as WebzyError).code).toBe('MISSING_WEBHOOK_SECRET');
      expect((err as WebzyError).statusCode).toBe(500);
    }

    expect(() =>
      new MockPaymentProvider({
        env: { NEXT_PUBLIC_APP_ENV: 'staging' } as NodeJS.ProcessEnv,
      }),
    ).toThrowError(WebzyError);
  });

  it('allows mock provider in local dev without MOCK_WEBHOOK_SECRET and in staging/prod when configured', () => {
    const localProvider = resolvePaymentProviderInstance({
      env: { NODE_ENV: 'development' } as NodeJS.ProcessEnv,
    });
    expect(localProvider.name).toBe('mock');

    const stagingProvider = resolvePaymentProviderInstance({
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_ENV: 'staging',
        PAYMENT_PROVIDER: 'mock',
        MOCK_WEBHOOK_SECRET: 'staging-secret-32-characters-minimum',
      } as NodeJS.ProcessEnv,
    });
    expect(stagingProvider.name).toBe('mock');

    const prodAllowedProvider = resolvePaymentProviderInstance({
      env: {
        NODE_ENV: 'production',
        PAYMENT_PROVIDER: 'mock',
        ALLOW_MOCK_IN_PROD: 'true',
        MOCK_WEBHOOK_SECRET: 'prod-secret-32-characters-minimum',
      } as NodeJS.ProcessEnv,
    });
    expect(prodAllowedProvider.name).toBe('mock');
  });

  it('parses Razorpay webhook events in production without invoking MockPaymentProvider', () => {
    const razorpay = resolvePaymentProviderInstance({
      env: {
        NODE_ENV: 'production',
        PAYMENT_PROVIDER: 'razorpay',
        RAZORPAY_KEY_SECRET: 'rzp_test_key_secret',
        RAZORPAY_WEBHOOK_SECRET: 'rzp_test_webhook_secret',
      } as NodeJS.ProcessEnv,
    });
    expect(razorpay).toBeInstanceOf(RazorpayPaymentProvider);

    const parsed = razorpay.parseEvent(
      JSON.stringify({
        id: 'evt_rzp_123',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_1',
              order_id: 'order_rzp_1',
              amount: 4900,
              currency: 'INR',
            },
          },
        },
      }),
    );
    expect(parsed.eventId).toBe('evt_rzp_123');
    expect(parsed.eventType).toBe('payment.captured');
    expect(parsed.providerOrderId).toBe('order_rzp_1');
    expect(parsed.providerPaymentId).toBe('pay_rzp_1');
    expect(parsed.amountPaise).toBe(4900);
  });
});
