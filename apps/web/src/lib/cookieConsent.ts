export interface CookieConsentState {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  version: string;
  updatedAt: string;
}

export const COOKIE_CONSENT_NAME = 'webzy_cookie_consent';
export const COOKIE_CONSENT_VERSION = '2026-04';
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 180;

export function readCookieConsent(): CookieConsentState | null {
  if (typeof document === 'undefined') return null;
  try {
    const entries = document.cookie.split(';');
    for (const entry of entries) {
      const idx = entry.indexOf('=');
      if (idx <= 0) continue;
      const key = entry.slice(0, idx).trim();
      if (key !== COOKIE_CONSENT_NAME) continue;
      const rawVal = decodeURIComponent(entry.slice(idx + 1).trim());
      const parsed = JSON.parse(rawVal) as Partial<CookieConsentState>;
      if (parsed && parsed.essential === true && typeof parsed.preferences === 'boolean') {
        return {
          essential: true,
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics),
          version: typeof parsed.version === 'string' ? parsed.version : COOKIE_CONSENT_VERSION,
          updatedAt:
            typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
        };
      }
    }
  } catch {
    // Ignore malformed cookie
  }
  return null;
}

export function writeCookieConsent(prefs: {
  preferences: boolean;
  analytics: boolean;
}): CookieConsentState {
  const next: CookieConsentState = {
    essential: true,
    preferences: prefs.preferences,
    analytics: prefs.analytics,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (typeof document !== 'undefined') {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
      JSON.stringify(next),
    )}; path=/; max-age=${SIX_MONTHS_SECONDS}; SameSite=Lax${secureFlag}`;

    // If preferences disabled, clean up optional non-essential browser storage preferences
    if (!next.preferences) {
      try {
        window.localStorage.removeItem('webzy_preferred_addons');
      } catch {
        // Ignore storage errors
      }
    }

    window.dispatchEvent(new CustomEvent('webzy_cookie_consent_updated', { detail: next }));
  }

  return next;
}

export function openCookieSettingsModal(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('webzy_open_cookie_settings'));
  }
}
