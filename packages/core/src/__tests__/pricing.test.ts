import { describe, expect, it } from 'vitest';
import {
  ADDON_CATALOG,
  canTransitionOrderStatus,
  computeOrderPricingPaise,
  formatInr,
  formatPaiseAsInr,
  getStorefrontCopy,
  parseLanguageCode,
  STOREFRONT_VALIDITY_ADDON_IDS,
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

  it('supports +500 INR lifetime hosting for ready-made themes', () => {
    expect(ADDON_CATALOG.lifetime.id).toBe('lifetime');
    expect(ADDON_CATALOG.lifetime.priceInr).toBe(500);
    expect(ADDON_CATALOG.lifetime.compareAtInr).toBe(999);
    expect(STOREFRONT_VALIDITY_ADDON_IDS).toEqual(['extend_14d', 'extend_21d', 'lifetime']);

    const res = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['pin', 'lifetime'],
      defaultValidityDays: 7,
      productType: 'ready_made',
    });

    expect(res.isLifetime).toBe(true);
    expect(res.validAddonIds).toHaveLength(2);
    expect(res.validAddonIds).toEqual(expect.arrayContaining(['pin', 'lifetime']));
    expect(res.basePaise).toBe(4900);
    expect(res.addonsPaise).toBe(50900);
    expect(res.totalPaise).toBe(55800);
  });

  it('strips lifetime add-on strictly on custom_made Studio orders', () => {
    const res = computeOrderPricingPaise({
      basePriceInr: 1499,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['pin', 'lifetime'],
      defaultValidityDays: 90,
      productType: 'custom_made',
    });

    expect(res.isLifetime).toBe(false);
    expect(res.validAddonIds).toEqual(['pin']);
    expect(res.addonsPaise).toBe(900);
    expect(res.totalPaise).toBe(150800);
    expect(res.validityDays).toBe(90);

    const onlyLifetime = computeOrderPricingPaise({
      basePriceInr: 1499,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['lifetime'],
      defaultValidityDays: 90,
      productType: 'custom_made',
    });
    expect(onlyLifetime.isLifetime).toBe(false);
    expect(onlyLifetime.validAddonIds).toEqual([]);
    expect(onlyLifetime.addonsPaise).toBe(0);
    expect(onlyLifetime.totalPaise).toBe(149900);
  });

  it('enforces strict validity tier hierarchy: lifetime > extend > extend_21d > extend_14d', () => {
    const base7 = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['extend'],
      selectedAddons: [],
      defaultValidityDays: 7,
    });
    expect(base7.validityDays).toBe(7);
    expect(base7.isLifetime).toBe(false);

    const d14 = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['extend'],
      selectedAddons: ['extend_14d'],
      defaultValidityDays: 7,
    });
    expect(d14.validityDays).toBe(14);
    expect(d14.validAddonIds).toEqual(['extend_14d']);
    expect(d14.isLifetime).toBe(false);

    const d21 = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['extend'],
      selectedAddons: ['extend_14d', 'extend_21d'],
      defaultValidityDays: 7,
    });
    expect(d21.validityDays).toBe(21);
    expect(d21.validAddonIds).toEqual(['extend_21d']);
    expect(d21.isLifetime).toBe(false);

    const d90 = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['extend'],
      selectedAddons: ['extend_14d', 'extend_21d', 'extend'],
      defaultValidityDays: 7,
    });
    expect(d90.validityDays).toBe(90);
    expect(d90.validAddonIds).toEqual(['extend']);
    expect(d90.isLifetime).toBe(false);

    const lifetime = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['extend'],
      selectedAddons: ['extend_14d', 'extend_21d', 'extend', 'lifetime'],
      defaultValidityDays: 7,
      productType: 'ready_made',
    });
    expect(lifetime.isLifetime).toBe(true);
    expect(lifetime.validAddonIds).toEqual(['lifetime']);
    expect(lifetime.addonsPaise).toBe(50000);
  });
});
