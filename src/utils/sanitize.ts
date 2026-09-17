/**
 * Escapes characters that are special in HTML to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes attribute value safely.
 */
export function escapeAttr(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * List of allowed URL schemes for href and src attributes.
 */
const ALLOWED_PROTOCOLS = new Set([
  'http:',
  'https:',
  'nostr:',
  'web+nostr:',
  'lightning:',
  'mailto:',
  'magnet:'
]);

/**
 * Validates and sanitizes a URL string.
 * Returns empty string if the URL is dangerous (e.g. javascript:, data:, etc.).
 */
export function sanitizeUrl(url: string, allowedProtocols = ALLOWED_PROTOCOLS): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Block control characters and common obfuscation tricks
  if (/[\x00-\x1F\x7F\u2028\u2029]/.test(trimmed)) {
    return '';
  }

  try {
    // Relative URLs or protocol-relative URLs
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }

    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }

    const parsed = new URL(trimmed);
    if (allowedProtocols.has(parsed.protocol.toLowerCase())) {
      return trimmed;
    }
    return '';
  } catch {
    // If it's a nostr: or lightning: URI that standard URL parser might fail on in some envs
    const schemeMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
    if (schemeMatch && allowedProtocols.has(schemeMatch[1].toLowerCase() + ':')) {
      return trimmed;
    }
    return '';
  }
}

/**
 * Validates an image or video URL strictly (http or https only).
 */
export function sanitizeMediaUrl(url: string): string {
  const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
  return sanitizeUrl(url, HTTP_PROTOCOLS);
}

/**
 * Sanitizes NIP-05 identifier (e.g. user@domain.com)
 */
export function sanitizeNip05(nip05: string): string {
  if (!nip05 || typeof nip05 !== 'string') return '';
  const trimmed = nip05.trim();
  // Valid nip05 format: <name>@<domain>
  if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '';
}

/**
 * Sanitizes Lightning Address (e.g. user@domain.com)
 */
export function sanitizeLud16(lud16: string): string {
  if (!lud16 || typeof lud16 !== 'string') return '';
  const trimmed = lud16.trim();
  if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '';
}
