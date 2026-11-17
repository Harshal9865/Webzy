import { describe, expect, it } from 'vitest';
import {
  evaluateAdminAccess,
  sanitizeRedirectPath,
  validateCheckoutConsent,
  validateProfileInput,
} from '../index';

describe('@webzy/core Phase 2 auth & consent rules', () => {
  it('sanitizes redirect paths to local routes only', () => {
    expect(sanitizeRedirectPath('/account')).toBe('/account');
    expect(sanitizeRedirectPath('https://evil.example/phish')).toBe('/account');
    expect(sanitizeRedirectPath('//evil.example')).toBe('/account');
    expect(sanitizeRedirectPath(undefined, '/')).toBe('/');
  });

  it('validates profile full name and phone format', () => {
    const valid = validateProfileInput({ fullName: 'Priti Sharma', phone: '+91 98765-43210' });
    expect(valid.fullName).toBe('Priti Sharma');
    expect(valid.phone).toBe('+919876543210');

    expect(() => validateProfileInput({ fullName: 'A', phone: '' })).toThrow(/full name/);
    expect(() => validateProfileInput({ fullName: 'Honey Patel', phone: '123' })).toThrow(/phone/);
  });

  it('requires age/parent + terms consent and photo permission when photos exist', () => {
    expect(() =>
      validateCheckoutConsent({
        ageOrParentConfirmed: false,
        termsAndRefundAccepted: true,
      }),
    ).toThrow(/18\+/);

    expect(() =>
      validateCheckoutConsent({
        ageOrParentConfirmed: true,
        termsAndRefundAccepted: true,
        hasPhotos: true,
        photoPermissionConfirmed: false,
      }),
    ).toThrow(/permission/);

    const records = validateCheckoutConsent({
      ageOrParentConfirmed: true,
      termsAndRefundAccepted: true,
      hasPhotos: true,
      photoPermissionConfirmed: true,
    });
    expect(records.map((r) => r.policy)).toEqual([
      'age_or_parent',
      'terms_and_refund',
      'photo_permission',
    ]);
  });

  it('enforces admin role plus AAL2 2FA gate', () => {
    expect(evaluateAdminAccess({ isAuthenticated: false })).toBe('unauthenticated');
    expect(evaluateAdminAccess({ isAuthenticated: true, role: 'user', aal: 'aal2' })).toBe(
      'forbidden',
    );
    expect(evaluateAdminAccess({ isAuthenticated: true, role: 'admin', aal: 'aal1' })).toBe(
      'mfa_required',
    );
    expect(
      evaluateAdminAccess({ isAuthenticated: true, role: 'admin', aal: 'aal2', isBanned: true }),
    ).toBe('forbidden');
    expect(evaluateAdminAccess({ isAuthenticated: true, role: 'admin', aal: 'aal2' })).toBe(
      'allowed',
    );
  });
});
