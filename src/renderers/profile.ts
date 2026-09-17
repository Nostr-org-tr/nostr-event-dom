import { escapeHtml, sanitizeMediaUrl, sanitizeUrl, sanitizeNip05, sanitizeLud16 } from '../utils/sanitize.js';
import { hexToNpub, formatTruncatedKey } from '../utils/nip19.js';
import { parseContentNodes, renderParsedContentToHtml } from '../utils/content-parser.js';
import type { NostrProfile, RenderContext } from '../types.js';

/**
 * Renders Kind 0 Metadata / User Profile card.
 */
export function renderProfile(ctx: RenderContext): string {
  const { event } = ctx;
  let profile: NostrProfile = {};

  try {
    profile = JSON.parse(event.content);
  } catch {
    profile = {};
  }

  const pubkey = event.pubkey;
  const npub = hexToNpub(pubkey);
  const profileUri = `nostr:${npub}`;

  const displayName = profile.display_name || profile.displayName || profile.name || formatTruncatedKey(npub, 8, 4);
  const username = profile.name ? `@${escapeHtml(profile.name)}` : '';
  const bannerUrl = profile.banner ? sanitizeMediaUrl(profile.banner) : '';
  const avatarUrl = profile.picture ? sanitizeMediaUrl(profile.picture) : '';
  const nip05 = profile.nip05 ? sanitizeNip05(profile.nip05) : '';
  const lud16 = profile.lud16 ? sanitizeLud16(profile.lud16) : '';
  const website = profile.website ? sanitizeUrl(profile.website) : '';

  const aboutParsed = profile.about ? parseContentNodes(profile.about) : null;
  const aboutHtml = aboutParsed ? renderParsedContentToHtml(aboutParsed.nodes, { renderInlineMedia: false }) : '';

  return `
  <article class="nostr-card nostr-profile-card" part="card profile-card">
    ${
      bannerUrl
        ? `<div class="nostr-profile-banner" style="background-image: url('${escapeHtml(bannerUrl)}');" part="banner"></div>`
        : `<div class="nostr-profile-banner" style="background: linear-gradient(135deg, var(--nostr-accent), #6366f1);" part="banner"></div>`
    }
    <div class="nostr-profile-content" part="profile-content">
      <div class="nostr-profile-avatar" part="avatar-wrap">
        ${
          avatarUrl
            ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(displayName)}" class="nostr-avatar" part="avatar" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
               <div class="nostr-avatar-fallback" style="display:none;" part="avatar-fallback">${escapeHtml(displayName.slice(0, 2))}</div>`
            : `<div class="nostr-avatar-fallback" part="avatar-fallback">${escapeHtml(displayName.slice(0, 2))}</div>`
        }
      </div>

      <div class="nostr-profile-name-row">
        <h2 class="nostr-profile-title" part="name">${escapeHtml(displayName)}</h2>
        ${username ? `<div class="nostr-handle" part="handle">${username}</div>` : ''}
        ${
          nip05
            ? `<div class="nostr-nip05 nostr-profile-nip05" part="nip05"><span class="nostr-nip05-badge">✓</span>${nip05}</div>`
            : ''
        }
      </div>

      ${aboutHtml ? `<div class="nostr-profile-about" part="about">${aboutHtml}</div>` : ''}

      <div class="nostr-profile-extra" part="profile-extra">
        ${
          website
            ? `<div class="nostr-profile-extra-item" part="website">
                <span>🔗</span>
                <a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer nofollow" class="nostr-link">${escapeHtml(website.replace(/^https?:\/\//, ''))}</a>
              </div>`
            : ''
        }
        ${
          lud16
            ? `<div class="nostr-profile-extra-item" part="lud16">
                <span>⚡</span>
                <a href="lightning:${escapeHtml(lud16)}" class="nostr-link">${escapeHtml(lud16)}</a>
              </div>`
            : ''
        }
        <div class="nostr-profile-extra-item" part="npub">
          <span>🔑</span>
          <a href="${escapeHtml(profileUri)}" class="nostr-link" title="${escapeHtml(npub)}">${formatTruncatedKey(npub, 10, 6)}</a>
        </div>
      </div>
    </div>
    <footer class="nostr-footer" part="footer">
      <span class="nostr-client-badge">Nostr Profile</span>
      <a href="${escapeHtml(profileUri)}" class="nostr-protocol-link" part="protocol-link">
        <span>⚡ Follow in Nostr</span>
      </a>
    </footer>
  </article>
  `;
}
