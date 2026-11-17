import { describe, expect, it } from 'vitest';
import { getWebzyPublicConfig, WEBZY_COLORS, WebzyError } from '../index';

describe('Phase 0 Core Config & Guardrails', () => {
  it('uses safe defaults matching Section 26 open-question config', () => {
    const cfg = getWebzyPublicConfig({ NODE_ENV: 'development' } as NodeJS.ProcessEnv);
    expect(cfg.appEnv).toBe('local');
    expect(cfg.paymentProvider).toBe('mock');
    expect(cfg.isMockPaymentMode).toBe(true);
    expect(cfg.payButtonDisabled).toBe(false);
    expect(cfg.defaultValidityDays).toBe(30);
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
});
