import { WebzyError } from './logger';

export type UserRole = 'user' | 'admin';
export type AuthenticatorAssuranceLevel = 'aal1' | 'aal2' | null;

export interface UserProfileRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
}

export interface ProfileUpdateInput {
  fullName: string;
  phone: string;
}

export interface CheckoutConsentInput {
  ageOrParentConfirmed: boolean;
  termsAndRefundAccepted: boolean;
  photoPermissionConfirmed?: boolean;
  hasPhotos?: boolean;
}

export const CURRENT_POLICY_VERSIONS = {
  age_or_parent: 'v0.1-draft',
  terms_and_refund: 'v0.1-draft',
  photo_permission: 'v0.1-draft',
} as const;

export function sanitizeRedirectPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return fallback;
  }
  return trimmed;
}

export function validateProfileInput(input: {
  fullName?: unknown;
  phone?: unknown;
}): ProfileUpdateInput {
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const phoneRaw = typeof input.phone === 'string' ? input.phone.trim() : '';
  const phoneDigits = phoneRaw.replace(/[\s\-()]/g, '');

  if (fullName.length < 2 || fullName.length > 80) {
    throw new WebzyError('Please enter your full name (2 to 80 characters).', {
      code: 'PROFILE_INVALID_NAME',
      statusCode: 400,
      retryable: true,
    });
  }

  if (phoneDigits && !/^\+?[0-9]{10,15}$/.test(phoneDigits)) {
    throw new WebzyError('Please enter a valid 10 to 15 digit phone number.', {
      code: 'PROFILE_INVALID_PHONE',
      statusCode: 400,
      retryable: true,
    });
  }

  return {
    fullName,
    phone: phoneDigits,
  };
}

export function validateCheckoutConsent(
  input: CheckoutConsentInput,
): Array<{ policy: keyof typeof CURRENT_POLICY_VERSIONS; version: string }> {
  if (!input.ageOrParentConfirmed) {
    throw new WebzyError('Please confirm you are 18+ or paying with a parent.', {
      code: 'CONSENT_AGE_REQUIRED',
      statusCode: 400,
      retryable: true,
    });
  }
  if (!input.termsAndRefundAccepted) {
    throw new WebzyError('Please accept the Terms and Refund policy to continue.', {
      code: 'CONSENT_TERMS_REQUIRED',
      statusCode: 400,
      retryable: true,
    });
  }
  if (input.hasPhotos && !input.photoPermissionConfirmed) {
    throw new WebzyError('Please confirm you have permission to use uploaded photos.', {
      code: 'CONSENT_PHOTO_PERMISSION_REQUIRED',
      statusCode: 400,
      retryable: true,
    });
  }

  const records: Array<{ policy: keyof typeof CURRENT_POLICY_VERSIONS; version: string }> = [
    { policy: 'age_or_parent', version: CURRENT_POLICY_VERSIONS.age_or_parent },
    { policy: 'terms_and_refund', version: CURRENT_POLICY_VERSIONS.terms_and_refund },
  ];

  if (input.hasPhotos || input.photoPermissionConfirmed) {
    records.push({
      policy: 'photo_permission',
      version: CURRENT_POLICY_VERSIONS.photo_permission,
    });
  }

  return records;
}

export function isAdminMfaRequired(): boolean {
  const explicit = process.env.ADMIN_REQUIRE_MFA?.trim().toLowerCase();
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() === 'production';
}

export function evaluateAdminAccess(params: {
  isAuthenticated: boolean;
  role?: UserRole | null;
  aal?: AuthenticatorAssuranceLevel;
  isBanned?: boolean;
  requireMfa?: boolean;
}): 'unauthenticated' | 'forbidden' | 'mfa_required' | 'allowed' {
  if (!params.isAuthenticated) return 'unauthenticated';
  if (params.isBanned) return 'forbidden';
  if (params.role !== 'admin') return 'forbidden';
  if ((params.requireMfa ?? true) && params.aal !== 'aal2') return 'mfa_required';
  return 'allowed';
}
