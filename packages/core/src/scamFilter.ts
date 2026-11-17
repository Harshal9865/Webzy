import { WebzyError } from './logger';

/**
 * Ready-made scam & abuse filter (Section 7 C-13, Section 18, Section 19):
 * Blocks external links, phone numbers, UPI IDs, IFSC codes, and emails
 * inside ready-made themes (allowing `whatsappPhone` only on business themes).
 */

const ZERO_WIDTH_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

const SCHEME_OR_LINK_RE = /(?:https?:\/\/|upi:\/\/|tel:|mailto:|javascript:|data:|www\.)/i;
const SHORTENER_OR_SOCIAL_DOMAIN_RE =
  /\b(?:bit\.ly|tinyurl\.com|t\.me|wa\.me|youtu\.be|rb\.gy|goo\.gl|Instagram\.com|Telegram\.me)\b/i;
const BARE_DOMAIN_RE =
  /\b[a-z0-9][a-z0-9-]{1,30}(?:\.|\s*(?:\[dot\]|\(dot\))\s*)(?:com|in|co\.in|org|net|xyz|me|ly|io|app|shop|online|site)\b/i;
const UPI_OR_EMAIL_RE = /\b[a-z0-9._-]{2,64}\s*@\s*[a-z]{2,20}(?:\.[a-z]{2,10})?/i;
const IFSC_RE = /\b[A-Z]{4}0[A-Z0-9]{6}\b/;
const PHONE_DIGITS_RE = /(?:\+?\d[\s.\-()]*){8,15}/g;
const INDIAN_MOBILE_RE = /^(?:91)?[6-9]\d{9}$/;

export type ScamViolationType = 'url' | 'upi_or_email' | 'phone' | 'ifsc';

export interface ScamCheckResult {
  allowed: boolean;
  violation?: ScamViolationType;
  reason?: string;
}

export function normalizeScamCheckText(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(ZERO_WIDTH_RE, '')
    .replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch)
    .trim();
}

export function detectScamPatterns(
  raw: string,
  options: { allowPhone?: boolean } = {},
): ScamCheckResult {
  const normalized = normalizeScamCheckText(raw);
  if (!normalized) return { allowed: true };

  if (
    SCHEME_OR_LINK_RE.test(normalized) ||
    SHORTENER_OR_SOCIAL_DOMAIN_RE.test(normalized) ||
    BARE_DOMAIN_RE.test(normalized)
  ) {
    return {
      allowed: false,
      violation: 'url',
      reason: 'Website links and URLs are not allowed inside ready-made greetings.',
    };
  }

  if (UPI_OR_EMAIL_RE.test(normalized)) {
    return {
      allowed: false,
      violation: 'upi_or_email',
      reason: 'UPI IDs and email addresses are blocked for safety on ready-made pages.',
    };
  }

  if (IFSC_RE.test(normalized.toUpperCase())) {
    return {
      allowed: false,
      violation: 'ifsc',
      reason: 'Bank / IFSC details are not allowed on greeting pages.',
    };
  }

  if (!options.allowPhone) {
    const matches = normalized.match(PHONE_DIGITS_RE) || [];
    for (const candidate of matches) {
      const digits = candidate.replace(/\D/g, '');
      if (digits.length >= 10 || INDIAN_MOBILE_RE.test(digits)) {
        return {
          allowed: false,
          violation: 'phone',
          reason: 'Phone numbers cannot be included inside ready-made greeting text.',
        };
      }
    }
  }

  return { allowed: true };
}

export function validateBusinessWhatsappNumber(raw: string): string | null {
  const digits = normalizeScamCheckText(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `91${digits}`;
  }
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  throw new WebzyError('Enter a valid 10-digit Indian WhatsApp mobile number.', {
    code: 'INVALID_BUSINESS_WHATSAPP',
    statusCode: 400,
    retryable: true,
  });
}

export function assertSafeReadyMadeText(
  fieldLabel: string,
  value: string,
  options: { allowPhone?: boolean } = {},
): string {
  const cleaned = value.replace(/\r\n/g, '\n').trim();
  const check = detectScamPatterns(cleaned, options);
  if (!check.allowed) {
    throw new WebzyError(`${fieldLabel}: ${check.reason}`, {
      code: `CONTENT_BLOCKED_${(check.violation || 'POLICY').toUpperCase()}`,
      statusCode: 422,
      retryable: true,
    });
  }
  return cleaned;
}
