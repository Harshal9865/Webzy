import { describe, expect, it } from 'vitest';
import {
  ADDON_CATALOG,
  BUSINESS_PRICE_TIERS,
  computeOrderPricingPaise,
  evaluateAdminAccess,
  getStorefrontCopy,
  parseLanguageCode,
} from '../index';
import { RazorpayPaymentProvider } from '../server';

describe('@webzy/core Phase 7 launch hardening invariants', () => {
  it('defaults storefront copy and language parser cleanly to English', () => {
    expect(parseLanguageCode(undefined)).toBe('en');
    expect(parseLanguageCode('unknown')).toBe('en');
    expect(getStorefrontCopy('en').hero.badge).toBe('Ready in 5 minutes · No app download');
  });

  it('maintains consistent discounted launch add-ons and pricing tiers', () => {
    expect(ADDON_CATALOG.pin.priceInr).toBe(9);
    expect(ADDON_CATALOG.video.priceInr).toBe(19);
    expect(ADDON_CATALOG.extend.priceInr).toBe(19);
    expect(BUSINESS_PRICE_TIERS.length).toBe(4);

    const calc = computeOrderPricingPaise({
      basePriceInr: 29,
      allowedAddons: ['pin', 'extend'],
      selectedAddons: ['pin', 'extend'],
      defaultValidityDays: 30,
    });
    expect(calc.totalPaise).toBe((29 + 9 + 19) * 100);
    expect(calc.validityDays).toBe(120);
  });

  it('requires verified Admin role AND AAL2 TOTP 2FA on admin console access', () => {
    expect(
      evaluateAdminAccess({ isAuthenticated: false, role: 'admin', aal: 'aal2', isBanned: false }),
    ).toBe('unauthenticated');
    expect(
      evaluateAdminAccess({ isAuthenticated: true, role: 'admin', aal: 'aal1', isBanned: false }),
    ).toBe('mfa_required');
    expect(
      evaluateAdminAccess({ isAuthenticated: true, role: 'user', aal: 'aal2', isBanned: false }),
    ).toBe('forbidden');
    expect(
      evaluateAdminAccess({ isAuthenticated: true, role: 'admin', aal: 'aal2', isBanned: false }),
    ).toBe('allowed');
    expect(
      evaluateAdminAccess({
        isAuthenticated: true,
        role: 'admin',
        aal: 'aal1',
        isBanned: false,
        requireMfa: false,
      }),
    ).toBe('allowed');
  });

  it('keeps live Razorpay gateway guarded before Section 27 Go-Live activation', async () => {
    const rzp = new RazorpayPaymentProvider();
    await expect(
      rzp.createOrder({
        internalOrderId: 'ord_1',
        amountPaise: 4900,
        currency: 'INR',
        receipt: 'rcpt_ord_1',
      }),
    ).rejects.toThrow();
  });
});
