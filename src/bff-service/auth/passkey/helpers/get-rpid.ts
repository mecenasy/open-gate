/**
 * Extracts RPID (Relying Party ID) from a request origin.
 * Uses registrable domain (eTLD+1) so passkeys work across all subdomains.
 * Falls back to fallbackUrl hostname if origin is missing.
 *
 * Examples:
 *   https://app.example.com  → example.com
 *   https://example.com      → example.com
 *   http://localhost:3000    → localhost
 */
export function getRpId(origin: string | undefined, fallbackUrl: string): string {
  const urlStr = origin || fallbackUrl;
  try {
    const normalized = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const { hostname } = new URL(normalized);

    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return hostname;
    }

    const parts = hostname.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
  } catch {
    return new URL(fallbackUrl).hostname;
  }
}
