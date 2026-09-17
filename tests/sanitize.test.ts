import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, sanitizeMediaUrl, sanitizeNip05, sanitizeLud16 } from '../src/utils/sanitize.js';

describe('Sanitizer & Security Verification', () => {
  it('should escape malicious HTML and script tags', () => {
    const malicious = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).not.toContain('<img');
    expect(escaped).toContain('&lt;script&gt;');
  });

  it('should block javascript: and dangerous data: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('javascript:/*--></title></style></textarea><em><script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  it('should allow valid http, https, and nostr URLs', () => {
    expect(sanitizeUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    expect(sanitizeUrl('http://insecure.com/path')).toBe('http://insecure.com/path');
    expect(sanitizeUrl('nostr:npub1234567890')).toBe('nostr:npub1234567890');
    expect(sanitizeUrl('lightning:user@domain.com')).toBe('lightning:user@domain.com');
  });

  it('should strictly filter media URLs to http/https', () => {
    expect(sanitizeMediaUrl('https://cdn.example.com/photo.png')).toBe('https://cdn.example.com/photo.png');
    expect(sanitizeMediaUrl('nostr:npub1234')).toBe('');
    expect(sanitizeMediaUrl('javascript:alert(1)')).toBe('');
  });

  it('should validate and sanitize NIP-05 identifiers', () => {
    expect(sanitizeNip05('alice@example.com')).toBe('alice@example.com');
    expect(sanitizeNip05('bob._-1@domain.co.uk')).toBe('bob._-1@domain.co.uk');
    expect(sanitizeNip05('<script>@domain.com')).toBe('');
    expect(sanitizeNip05('invalid nip05')).toBe('');
  });

  it('should validate and sanitize Lightning Addresses (lud16)', () => {
    expect(sanitizeLud16('satoshi@walletofsatoshi.com')).toBe('satoshi@walletofsatoshi.com');
    expect(sanitizeLud16('fake"onclick=alert(1)')).toBe('');
  });
});
