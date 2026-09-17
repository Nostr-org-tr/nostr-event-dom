import { escapeHtml, sanitizeMediaUrl, sanitizeNip05 } from '../utils/sanitize.js';
import { formatTruncatedKey, hexToNpub, hexToNote } from '../utils/nip19.js';
import type { NostrProfile, RenderContext } from '../types.js';

/**
 * Formats a unix timestamp into relative time or formatted date.
 */
export function formatTimestamp(unixSeconds: number): string {
  if (!unixSeconds) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixSeconds;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;

  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Renders the author avatar element.
 */
export function renderAvatar(profile?: NostrProfile, pubkey = ''): string {
  const avatarUrl = profile?.picture ? sanitizeMediaUrl(profile.picture) : '';
  const displayName = profile?.display_name || profile?.displayName || profile?.name || formatTruncatedKey(pubkey);

  if (avatarUrl) {
    return `<div class="nostr-avatar-wrap" part="avatar-wrap">
      <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(displayName)}" class="nostr-avatar" part="avatar" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      <div class="nostr-avatar-fallback" style="display:none;" part="avatar-fallback">${escapeHtml(displayName.slice(0, 2))}</div>
    </div>`;
  }

  const initial = displayName.slice(0, 2) || '⚡';
  return `<div class="nostr-avatar-wrap" part="avatar-wrap">
    <div class="nostr-avatar-fallback" part="avatar-fallback">${escapeHtml(initial)}</div>
  </div>`;
}

/**
 * Renders the author header block with avatar, display name, nip-05, and timestamp.
 */
export function renderAuthorHeader(ctx: RenderContext): string {
  const { event, authorProfile } = ctx;
  const pubkey = event.pubkey;
  const npub = hexToNpub(pubkey);
  const authorUri = `nostr:${npub}`;

  const displayName =
    authorProfile?.display_name ||
    authorProfile?.displayName ||
    authorProfile?.name ||
    formatTruncatedKey(npub, 8, 4);

  const username = authorProfile?.name ? `@${escapeHtml(authorProfile.name)}` : '';
  const cleanNip05 = authorProfile?.nip05 ? sanitizeNip05(authorProfile.nip05) : '';

  const timeStr = formatTimestamp(event.created_at);
  const noteId = hexToNote(event.id);
  const noteUri = `nostr:${noteId}`;

  return `
  <header class="nostr-header" part="header">
    <a href="${escapeHtml(authorUri)}" class="nostr-avatar-link" part="avatar-link" title="${escapeHtml(displayName)}">
      ${renderAvatar(authorProfile, pubkey)}
    </a>
    <div class="nostr-author-meta" part="author-meta">
      <div class="nostr-author-row">
        <a href="${escapeHtml(authorUri)}" class="nostr-name" part="name">${escapeHtml(displayName)}</a>
        ${
          cleanNip05
            ? `<span class="nostr-nip05" part="nip05"><span class="nostr-nip05-badge">✓</span>${cleanNip05}</span>`
            : ''
        }
      </div>
      <div class="nostr-author-row">
        ${username ? `<span class="nostr-handle" part="handle">${username}</span> • ` : ''}
        <a href="${escapeHtml(noteUri)}" class="nostr-time" part="time" title="${new Date(event.created_at * 1000).toISOString()}">${escapeHtml(timeStr)}</a>
      </div>
    </div>
  </header>
  `;
}

/**
 * Renders the bottom footer bar with Nostr protocol link.
 */
export function renderFooter(ctx: RenderContext): string {
  const { event } = ctx;
  const noteId = hexToNote(event.id);
  const nostrUri = `nostr:${noteId}`;

  return `
  <footer class="nostr-footer" part="footer">
    <div class="nostr-footer-left">
      <span class="nostr-client-badge">Nostr Event</span>
    </div>
    <div class="nostr-footer-right">
      <a href="${escapeHtml(nostrUri)}" class="nostr-protocol-link" part="protocol-link" title="Open with your Nostr client">
        <span>⚡ Open in Nostr client</span>
      </a>
    </div>
  </footer>
  `;
}
