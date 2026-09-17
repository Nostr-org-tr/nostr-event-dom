import { escapeHtml, sanitizeMediaUrl } from '../utils/sanitize.js';
import { parseContentNodes, renderParsedContentToHtml } from '../utils/content-parser.js';
import { renderAuthorHeader, renderFooter } from './common.js';
import type { RenderContext } from '../types.js';

/**
 * Renders Media Events:
 * - Kind 20: Photo / Picture (NIP-68)
 * - Kind 21 / 34235: Video (NIP-71)
 * - Kind 22 / 34236: Short / Vertical Video (NIP-71)
 */
export function renderMedia(ctx: RenderContext): string {
  const { event, hideAuthor } = ctx;
  const isShort = event.kind === 22 || event.kind === 34236;
  const isPhoto = event.kind === 20;

  let mediaUrl = '';
  let posterUrl = '';
  let title = '';
  let altText = 'Nostr Media';

  for (const tag of event.tags) {
    if (!tag || tag.length < 2) continue;
    const key = tag[0];

    if (key === 'url' && !mediaUrl) {
      mediaUrl = tag[1];
    } else if (key === 'thumb' || key === 'image') {
      posterUrl = tag[1];
    } else if (key === 'title' || key === 'name') {
      title = tag[1];
    } else if (key === 'alt') {
      altText = tag[1];
    } else if (key === 'imeta') {
      // Parse NIP-92 / NIP-71 imeta tag (e.g. url https://... dim 1920x1080)
      for (const entry of tag.slice(1)) {
        const [metaKey, metaVal] = entry.split(' ');
        if (metaKey === 'url' && metaVal && !mediaUrl) {
          mediaUrl = metaVal;
        } else if ((metaKey === 'image' || metaKey === 'thumb') && metaVal && !posterUrl) {
          posterUrl = metaVal;
        } else if (metaKey === 'alt' && metaVal) {
          altText = metaVal;
        }
      }
    }
  }

  // If no URL tag, check if event content itself contains the media URL
  if (!mediaUrl && event.content) {
    const urlMatch = event.content.match(/https?:\/\/[^\s<]+/);
    if (urlMatch) {
      mediaUrl = urlMatch[0];
    }
  }

  const safeMediaUrl = sanitizeMediaUrl(mediaUrl);
  const safePosterUrl = posterUrl ? sanitizeMediaUrl(posterUrl) : '';

  const { nodes } = parseContentNodes(event.content, event.tags);
  const descriptionHtml = renderParsedContentToHtml(nodes, { renderInlineMedia: false });

  let mediaElement = '';

  if (isPhoto) {
    mediaElement = `
    <div class="nostr-media-player-wrap" part="photo-wrap">
      <img src="${escapeHtml(safeMediaUrl)}" alt="${escapeHtml(altText)}" class="nostr-photo-viewer" part="photo" loading="lazy" />
    </div>
    `;
  } else if (isShort) {
    mediaElement = `
    <div class="nostr-media-player-wrap nostr-short-player" part="short-wrap">
      <video src="${escapeHtml(safeMediaUrl)}" ${safePosterUrl ? `poster="${escapeHtml(safePosterUrl)}"` : ''} controls playsinline loop class="nostr-short-video" part="short-video"></video>
    </div>
    `;
  } else {
    mediaElement = `
    <div class="nostr-media-player-wrap nostr-video-player" part="video-wrap">
      <video src="${escapeHtml(safeMediaUrl)}" ${safePosterUrl ? `poster="${escapeHtml(safePosterUrl)}"` : ''} controls playsinline class="nostr-media-video" part="video"></video>
    </div>
    `;
  }

  return `
  <article class="nostr-card nostr-media-card ${isShort ? 'nostr-short-card' : ''}" part="card media-card ${isShort ? 'short-card' : ''}">
    ${!hideAuthor ? renderAuthorHeader(ctx) : ''}
    ${safeMediaUrl ? mediaElement : ''}
    <div class="nostr-media-meta" part="media-meta">
      ${title ? `<h3 class="nostr-media-title" part="media-title">${escapeHtml(title)}</h3>` : ''}
      ${descriptionHtml ? `<div class="nostr-body nostr-media-description" part="description">${descriptionHtml}</div>` : ''}
    </div>
    ${renderFooter(ctx)}
  </article>
  `;
}
