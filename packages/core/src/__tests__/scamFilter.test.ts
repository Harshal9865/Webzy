import { describe, expect, it } from 'vitest';
import {
  assertSafeReadyMadeText,
  detectScamPatterns,
  validateBusinessWhatsappNumber,
} from '../index';

describe('@webzy/core scam & link blocker', () => {
  it('blocks external URLs, shortlinks, emails, UPI IDs, and IFSC codes', () => {
    expect(detectScamPatterns('Check https://evil.example/gift').allowed).toBe(false);
    expect(detectScamPatterns('Visit myshop.com today').allowed).toBe(false);
    expect(detectScamPatterns('Pay me at honey@ybl please').allowed).toBe(false);
    expect(detectScamPatterns('Bank IFSC SBIN0001234').allowed).toBe(false);
  });

  it('blocks Indian phone numbers including Devanagari digits in non-business text', () => {
    expect(detectScamPatterns('Call me 9876543210').allowed).toBe(false);
    expect(detectScamPatterns('Call ९८७६५४३२१०').allowed).toBe(false);
    expect(() => assertSafeReadyMadeText('Message', 'Pay at upi@okicici')).toThrow(/blocked/i);
  });

  it('allows clean multi-sentence celebratory copy while blocking obfuscated domains', () => {
    expect(detectScamPatterns('Happy Birthday. In the coming year stay blessed.').allowed).toBe(true);
    expect(detectScamPatterns('Love you. Me and you forever.').allowed).toBe(true);
    expect(detectScamPatterns('Visit myshop [dot] in today').allowed).toBe(false);
    expect(detectScamPatterns('Happy Birthday Priti! Aaj party meri taraf se.').allowed).toBe(true);
    expect(validateBusinessWhatsappNumber('+91 98765-43210')).toBe('919876543210');
    expect(() => validateBusinessWhatsappNumber('abc123')).toThrow(/WhatsApp/);
  });
});
