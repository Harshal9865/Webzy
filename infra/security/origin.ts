function extractHostname(rawUrlOrHost: string | null | undefined): string | null {
  if (!rawUrlOrHost) return null;
  const trimmed = rawUrlOrHost.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.includes('://')) {
      return new URL(trimmed).host.toLowerCase();
    }
    return trimmed.split(',')[0].trim().toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Edge-safe Same-Origin / CSRF verification for browser-triggered API mutations.
 * Compares Origin (or Referer fallback) against Host / X-Forwarded-Host and
 * configured Web/Admin origins without importing Node-only built-ins.
 */
export function verifySameOriginRequest(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const originHeader = request.headers.get('origin');
  const refererHeader = request.headers.get('referer');
  const sourceHost = extractHostname(originHeader) || extractHostname(refererHeader);

  // If caller sent neither Origin nor Referer, allow only in non-production (local / cron callers enforce Bearer secrets separately)
  if (!sourceHost) {
    return process.env.NEXT_PUBLIC_APP_ENV !== 'production';
  }

  const allowedHosts = new Set<string>();
  const requestHost =
    extractHostname(request.headers.get('x-forwarded-host')) ||
    extractHostname(request.headers.get('host'));
  if (requestHost) allowedHosts.add(requestHost);

  const webHost = extractHostname(process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000');
  const adminHost = extractHostname(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001');
  if (webHost) allowedHosts.add(webHost);
  if (adminHost) allowedHosts.add(adminHost);

  return allowedHosts.has(sourceHost);
}
