import { describe, expect, it } from 'vitest';
import {
  canTransitionOrderStatus,
  computeOrderPricingPaise,
  formatInr,
  formatPaiseAsInr,
  getStorefrontCopy,
  parseLanguageCode,
} from '../index';

describe('@webzy/core Phase 1 & Phase 4 pricing + order state machine', () => {
  it('defaults unknown language codes to en', () => {
    expect(parseLanguageCode(undefined)).toBe('en');
    expect(parseLanguageCode('hinglish')).toBe('hinglish');
    expect(parseLanguageCode('hi')).toBe('hi');
    expect(parseLanguageCode('en')).toBe('en');
  });

  it('returns localized copy for all 3 launch languages', () => {
    expect(getStorefrontCopy('hinglish').nav.makeYours).toBe('Apna banao');
    expect(getStorefrontCopy('hi').nav.makeYours).toBe('अपना बनाओ');
    expect(getStorefrontCopy('en').nav.makeYours).toBe('Create yours');
  });

  it('computes server pricing with discounted add-ons and never allows below ₹1 total', () => {
    const res = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['pin', 'extend'],
      selectedAddons: ['pin', 'video', 'pin'],
      defaultValidityDays: 30,
    });
    expect(res.validAddonIds).toEqual(['pin']);
    expect(res.basePaise).toBe(4900);
    expect(res.addonsPaise).toBe(900);
    expect(res.totalPaise).toBe(5800);
    expect(res.feeEstimatePaise).toBe(Math.round(5800 * 0.0236));
    expect(res.validityDays).toBe(30);

    const floor = computeOrderPricingPaise({
      basePriceInr: 29,
      allowedAddons: [],
      couponDiscountPaise: 99999,
    });
    expect(floor.totalPaise).toBe(100);
    expect(formatInr(149)).toBe('₹149');
    expect(formatPaiseAsInr(5800)).toBe('₹58');
  });

  it('enforces monotonic order transitions cleanly', () => {
    expect(canTransitionOrderStatus('payment_pending', 'paid')).toBe(true);
    expect(canTransitionOrderStatus('failed', 'paid')).toBe(true);
    expect(canTransitionOrderStatus('published', 'failed')).toBe(false);
    expect(canTransitionOrderStatus('paid', 'payment_pending')).toBe(false);
    expect(canTransitionOrderStatus('refunded', 'published')).toBe(false);
  });
});
