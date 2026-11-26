import { describe, expect, it } from 'vitest';
import * as core from '../index';
import {
  ADDON_CATALOG,
  assertSafeReadyMadeText,
  canTransitionOrderStatus,
  computeOrderPricingPaise,
  detectScamPatterns,
  evaluateCapacitySlot,
  evaluateSiteDeletionAndRestore,
  sanitizeRedirectPath,
  SITE_DELETE_GRACE_DAYS,
  STOREFRONT_VALIDITY_ADDON_IDS,
  validateCheckoutConsent,
  WebzyError,
} from '../index';
import { detectImageMime } from '../server';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('@webzy/core platform lifecycle, bots, load & blackbox suite', () => {
  it('Bot 1 (Occasion Birthday Buyer): buys 49 INR theme + PIN + 14d TTL with GST/fee & consents', () => {
    const consents = validateCheckoutConsent({
      ageOrParentConfirmed: true,
      termsAndRefundAccepted: true,
      hasPhotos: true,
      photoPermissionConfirmed: true,
    });
    expect(consents.map((c) => c.policy)).toEqual([
      'age_or_parent',
      'terms_and_refund',
      'photo_permission',
    ]);

    const pricing = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['pin', 'extend_14d'],
      defaultValidityDays: 7,
      productType: 'ready_made',
    });

    expect(pricing.isLifetime).toBe(false);
    expect(pricing.validityDays).toBe(14);
    expect(pricing.basePaise).toBe(4900);
    expect(pricing.addonsPaise).toBe(1800);
    expect(pricing.totalPaise).toBe(6700);
    expect(pricing.feeEstimatePaise).toBe(Math.round(6700 * 0.0236));
    expect(pricing.validAddonIds).toEqual(expect.arrayContaining(['pin', 'extend_14d']));

    const orderOk = canTransitionOrderStatus('payment_pending', 'paid');
    const publishOk = canTransitionOrderStatus('paid', 'published');
    expect(orderOk).toBe(true);
    expect(publishOk).toBe(true);
  });

  it('Bot 2 (Ready-Made Wedding + 500 INR Lifetime Buyer): sets isLifetime=true and never expires', () => {
    expect(ADDON_CATALOG.lifetime.priceInr).toBe(500);
    expect(STOREFRONT_VALIDITY_ADDON_IDS).toContain('lifetime');

    const pricing = computeOrderPricingPaise({
      basePriceInr: 499,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['video', 'lifetime'],
      defaultValidityDays: 7,
      productType: 'ready_made',
    });

    expect(pricing.isLifetime).toBe(true);
    expect(pricing.basePaise).toBe(49900);
    expect(pricing.addonsPaise).toBe(51900);
    expect(pricing.totalPaise).toBe(101800);
    expect(pricing.validAddonIds).toEqual(expect.arrayContaining(['video', 'lifetime']));

    const farFutureMs = Date.UTC(2035, 0, 1);
    const lifecycle = evaluateSiteDeletionAndRestore({
      status: 'live',
      deletedAt: null,
      deleteGraceUntil: null,
      expiresAt: null,
      isLifetime: true,
      nowMs: farFutureMs,
    });
    expect(lifecycle.isSoftDeleted).toBe(false);
    expect(lifecycle.canSoftDelete).toBe(true);
    expect(lifecycle.canRestore).toBe(false);
  });

  it('Bot 3 (Quarrel Delete + Grace Restore Buyer): soft-deletes, restores at Day 3, denied after Day 7 or moderation removal', () => {
    expect(SITE_DELETE_GRACE_DAYS).toBe(7);

    const t0 = Date.UTC(2026, 10, 1, 10, 0, 0);
    const graceUntilIso = new Date(t0 + SITE_DELETE_GRACE_DAYS * DAY_MS).toISOString();
    const deletedAtIso = new Date(t0).toISOString();
    const normalExpiryIso = new Date(t0 + 14 * DAY_MS).toISOString();

    const beforeDelete = evaluateSiteDeletionAndRestore({
      status: 'live',
      deletedAt: null,
      deleteGraceUntil: null,
      expiresAt: normalExpiryIso,
      isLifetime: false,
      nowMs: t0,
    });
    expect(beforeDelete.canSoftDelete).toBe(true);
    expect(beforeDelete.isSoftDeleted).toBe(false);
    expect(beforeDelete.canRestore).toBe(false);

    const atDay3 = evaluateSiteDeletionAndRestore({
      status: 'hidden',
      deletedAt: deletedAtIso,
      deleteGraceUntil: graceUntilIso,
      expiresAt: normalExpiryIso,
      isLifetime: false,
      nowMs: t0 + 3 * DAY_MS,
    });
    expect(atDay3.isSoftDeleted).toBe(true);
    expect(atDay3.canSoftDelete).toBe(false);
    expect(atDay3.canRestore).toBe(true);
    expect(atDay3.graceRemainingDays).toBeGreaterThanOrEqual(4);

    const atDay8 = evaluateSiteDeletionAndRestore({
      status: 'hidden',
      deletedAt: deletedAtIso,
      deleteGraceUntil: graceUntilIso,
      expiresAt: normalExpiryIso,
      isLifetime: false,
      nowMs: t0 + 8 * DAY_MS,
    });
    expect(atDay8.isSoftDeleted).toBe(true);
    expect(atDay8.canRestore).toBe(false);
    expect(atDay8.reason).toMatch(/restore window.*expired/i);

    const moderated = evaluateSiteDeletionAndRestore({
      status: 'removed',
      deletedAt: deletedAtIso,
      deleteGraceUntil: graceUntilIso,
      expiresAt: normalExpiryIso,
      isLifetime: false,
      nowMs: t0 + 1 * DAY_MS,
    });
    expect(moderated.canRestore).toBe(false);
    expect(moderated.reason).toMatch(/permanently removed/i);
  });

  it('Bot 4 (Custom Wedding Buyer vs Admin Capacity Limit): enforces limit=2, pause, and resume at limit=5', () => {
    const slot0 = evaluateCapacitySlot({
      paused: false,
      limit: 2,
      activeCount: 0,
      capacityMessage: 'Bookings full for this week.',
    });
    expect(slot0.acceptingOrders).toBe(true);
    expect(slot0.remainingSlots).toBe(2);

    const afterBot4a = evaluateCapacitySlot({
      paused: false,
      limit: 2,
      activeCount: 1,
      capacityMessage: 'Bookings full for this week.',
    });
    expect(afterBot4a.acceptingOrders).toBe(true);
    expect(afterBot4a.remainingSlots).toBe(1);

    const afterBot4b = evaluateCapacitySlot({
      paused: false,
      limit: 2,
      activeCount: 2,
      capacityMessage: 'Bookings full for this week.',
    });
    expect(afterBot4b.acceptingOrders).toBe(false);
    expect(afterBot4b.remainingSlots).toBe(0);

    const adminPaused = evaluateCapacitySlot({
      paused: true,
      limit: 5,
      activeCount: 2,
      capacityMessage: 'Studio temporarily paused.',
    });
    expect(adminPaused.acceptingOrders).toBe(false);
    expect(adminPaused.paused).toBe(true);
    expect(adminPaused.capacityMessage).toBe('Studio temporarily paused.');

    const adminResumed = evaluateCapacitySlot({
      paused: false,
      limit: 5,
      activeCount: 2,
      capacityMessage: 'Bookings open.',
    });
    expect(adminResumed.acceptingOrders).toBe(true);
    expect(adminResumed.remainingSlots).toBe(3);
  });

  it('Bot 5 (Bespoke Custom Made + Attempted 500 INR Lifetime Exploit): strips lifetime silently', () => {
    const exploitAttempt = computeOrderPricingPaise({
      basePriceInr: 2999,
      allowedAddons: ['pin', 'video', 'extend'],
      selectedAddons: ['pin', 'video', 'lifetime'],
      defaultValidityDays: 90,
      productType: 'custom_made',
    });

    expect(exploitAttempt.isLifetime).toBe(false);
    expect(exploitAttempt.validAddonIds).not.toContain('lifetime');
    expect(exploitAttempt.validAddonIds).toEqual(expect.arrayContaining(['pin', 'video']));
    expect(exploitAttempt.addonsPaise).toBe(2800);
    expect(exploitAttempt.totalPaise).toBe(299900 + 2800);
    expect(exploitAttempt.validityDays).toBe(90);
  });

  it('Bot 6 (Blackbox Adversarial Bot): neutralizes XSS, scam URLs/UPI, invalid TTL/price, and illegal status downgrades', () => {
    // 1. XSS neutralization across core surface
    expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/account');
    expect(sanitizeRedirectPath('//attacker.example/steal')).toBe('/account');
    expect(detectScamPatterns('javascript:alert(1)').allowed).toBe(false);
    expect(detectImageMime(Buffer.from('<script>alert(1)</script>'))).toBeNull();

    const maybeCore = core as Record<string, unknown>;
    if (typeof maybeCore.sanitizeHtmlText === 'function') {
      const sanitized = (maybeCore.sanitizeHtmlText as (s: string) => string)(
        '<script>alert(1)</script>Warm Wishes',
      );
      expect(sanitized.toLowerCase()).not.toContain('<script>');
    }

    // 2. Scam URLs and UPI fraud phrases
    const bitlyCheck = detectScamPatterns('Open bit.ly/claim-prize now');
    expect(bitlyCheck.allowed).toBe(false);
    expect(bitlyCheck.violation).toBe('url');

    const upiCheck = detectScamPatterns('Pay Rs 500 to urgent.verify@okicici');
    expect(upiCheck.allowed).toBe(false);
    expect(upiCheck.violation).toBe('upi_or_email');

    expect(() =>
      assertSafeReadyMadeText('Message', 'Claim reward at https://bit.ly/win-upi'),
    ).toThrow(WebzyError);

    if (typeof maybeCore.checkScamContent === 'function') {
      const scamRes = (maybeCore.checkScamContent as (s: string) => { allowed: boolean })(
        'Visit bit.ly/scam and pay scam@ybl',
      );
      expect(scamRes.allowed).toBe(false);
    }

    // 3. Invalid 0-day / negative TTL & invalid base price
    const zeroTtl = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['pin'],
      defaultValidityDays: 0,
    });
    expect(zeroTtl.validityDays).toBe(7);

    const negativeTtl = computeOrderPricingPaise({
      basePriceInr: 49,
      allowedAddons: ['pin'],
      defaultValidityDays: -30,
    });
    expect(negativeTtl.validityDays).toBe(7);

    expect(() =>
      computeOrderPricingPaise({
        basePriceInr: 0,
        allowedAddons: [],
      }),
    ).toThrow(WebzyError);

    expect(() =>
      computeOrderPricingPaise({
        basePriceInr: -99,
        allowedAddons: [],
      }),
    ).toThrow(WebzyError);

    // 4. Illegal order status downgrades
    expect(canTransitionOrderStatus('published', 'payment_pending')).toBe(false);
    expect(canTransitionOrderStatus('published', 'draft')).toBe(false);
    expect(canTransitionOrderStatus('published', 'failed')).toBe(false);
    expect(canTransitionOrderStatus('paid', 'payment_pending')).toBe(false);
    expect(canTransitionOrderStatus('refunded', 'published')).toBe(false);
    expect(canTransitionOrderStatus('cancelled', 'paid')).toBe(false);
  });

  it('250-User Concurrent Multi-Order Load Simulation: enforces invariants and finishes in under 250ms', () => {
    const basePrices = [29, 49, 79, 99, 499, 1499] as const;
    const addonBuckets: string[][] = [
      [],
      ['pin'],
      ['pin', 'extend_14d'],
      ['video', 'extend_21d'],
      ['extend'],
      ['pin', 'video', 'lifetime'],
    ];

    const t0 = Date.UTC(2026, 10, 15, 12, 0, 0);
    const startMs = performance.now();

    for (let i = 0; i < 250; i++) {
      const basePriceInr = basePrices[i % basePrices.length];
      const productType = basePriceInr >= 1499 ? 'custom_made' : 'ready_made';
      const selectedAddons = addonBuckets[i % addonBuckets.length];
      const couponDiscountPaise = i % 7 === 0 ? 1000 : 0;

      const pricingFirst = computeOrderPricingPaise({
        basePriceInr,
        allowedAddons: ['pin', 'video', 'extend'],
        selectedAddons,
        couponDiscountPaise,
        defaultValidityDays: productType === 'custom_made' ? 90 : 7,
        productType,
      });

      const pricingSecond = computeOrderPricingPaise({
        basePriceInr,
        allowedAddons: ['pin', 'video', 'extend'],
        selectedAddons,
        couponDiscountPaise,
        defaultValidityDays: productType === 'custom_made' ? 90 : 7,
        productType,
      });

      expect(pricingFirst).toEqual(pricingSecond);
      expect(Number.isFinite(pricingFirst.totalPaise)).toBe(true);
      expect(pricingFirst.totalPaise).toBeGreaterThanOrEqual(100);
      expect(Number.isFinite(pricingFirst.feeEstimatePaise)).toBe(true);
      expect(pricingFirst.feeEstimatePaise).toBeGreaterThanOrEqual(0);

      if (productType === 'custom_made') {
        expect(pricingFirst.isLifetime).toBe(false);
        expect(pricingFirst.validAddonIds).not.toContain('lifetime');
      }

      const dayOffset = i % 10;
      const isSoftDeleted = i % 3 === 0;
      const isModerated = i % 19 === 0;
      const lifecycle = evaluateSiteDeletionAndRestore({
        status: isModerated ? 'removed' : isSoftDeleted ? 'hidden' : 'live',
        deletedAt: isSoftDeleted ? new Date(t0).toISOString() : null,
        deleteGraceUntil: isSoftDeleted
          ? new Date(t0 + SITE_DELETE_GRACE_DAYS * DAY_MS).toISOString()
          : null,
        expiresAt: pricingFirst.isLifetime
          ? null
          : new Date(t0 + pricingFirst.validityDays * DAY_MS).toISOString(),
        isLifetime: pricingFirst.isLifetime,
        nowMs: t0 + dayOffset * DAY_MS,
      });

      if (isSoftDeleted && !isModerated && dayOffset < SITE_DELETE_GRACE_DAYS) {
        expect(lifecycle.canRestore).toBe(true);
      } else if (isSoftDeleted && isModerated) {
        expect(lifecycle.canRestore).toBe(false);
        expect(lifecycle.reason).toMatch(/permanently removed/i);
      } else if (isSoftDeleted && dayOffset > SITE_DELETE_GRACE_DAYS) {
        expect(lifecycle.canRestore).toBe(false);
        expect(lifecycle.reason).toMatch(/restore window.*expired/i);
      }

      const cap = evaluateCapacitySlot({
        paused: i % 11 === 0,
        limit: 10,
        activeCount: i % 12,
        capacityMessage: 'Capacity status',
      });
      expect(cap.remainingSlots).toBeGreaterThanOrEqual(0);
      if (cap.paused || cap.activeCount >= cap.limit) {
        expect(cap.acceptingOrders).toBe(false);
      } else {
        expect(cap.acceptingOrders).toBe(true);
      }
    }

    const elapsedMs = performance.now() - startMs;
    expect(elapsedMs).toBeLessThan(250);
  });
});
