import { escapeHtml, sanitizeMediaUrl } from '../utils/sanitize.js';
import { parseContentNodes, renderParsedContentToHtml } from '../utils/content-parser.js';
import { renderAuthorHeader, renderFooter } from './common.js';
import type { RenderContext } from '../types.js';

function formatEventDate(timestampStr?: string): string {
  if (!timestampStr) return '';
  const num = parseInt(timestampStr, 10);
  if (isNaN(num)) {
    // Check if ISO date string (e.g. YYYY-MM-DD)
    return timestampStr;
  }
  const date = new Date(num * 1000);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Renders Kind 31922 (Date-based) and Kind 31923 (Time-based) Calendar Events (NIP-52).
 */
export function renderCalendarEvent(ctx: RenderContext): string {
  const { event, hideAuthor } = ctx;

  const tagMap = new Map<string, string>();
  const hashtags: string[] = [];

  for (const tag of event.tags) {
    if (!tag || tag.length < 2) continue;
    if (tag[0] === 't') {
      hashtags.push(tag[1]);
    } else if (!tagMap.has(tag[0])) {
      tagMap.set(tag[0], tag[1]);
    }
  }

  const title = tagMap.get('name') || tagMap.get('title') || 'Calendar Event';
  const summary = tagMap.get('summary') || '';
  const location = tagMap.get('location') || '';
  const startStr = tagMap.get('start');
  const endStr = tagMap.get('end');
  const image = tagMap.get('image') ? sanitizeMediaUrl(tagMap.get('image')!) : '';

  const startDateFormatted = formatEventDate(startStr);
  const endDateFormatted = formatEventDate(endStr);

  const { nodes } = parseContentNodes(event.content || summary, event.tags);
  const descriptionHtml = renderParsedContentToHtml(nodes);

  return `
  <article class="nostr-card nostr-event-calendar" part="card calendar-card">
    <div class="nostr-cal-badge" part="badge">📅 Nostr Event</div>
    ${
      image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="nostr-article-cover" part="event-cover" loading="lazy" />`
        : ''
    }
    <h2 class="nostr-cal-title" part="title">${escapeHtml(title)}</h2>

    <div class="nostr-cal-details" part="details">
      ${
        startDateFormatted
          ? `<div class="nostr-cal-label">When:</div>
             <div class="nostr-cal-value">
               <strong>${escapeHtml(startDateFormatted)}</strong>
               ${endDateFormatted ? ` &ndash; <strong>${escapeHtml(endDateFormatted)}</strong>` : ''}
             </div>`
          : ''
      }
      ${
        location
          ? `<div class="nostr-cal-label">Where:</div>
             <div class="nostr-cal-value">📍 ${escapeHtml(location)}</div>`
          : ''
      }
    </div>

    ${descriptionHtml ? `<div class="nostr-body nostr-cal-description" part="description">${descriptionHtml}</div>` : ''}

    ${!hideAuthor ? renderAuthorHeader(ctx) : ''}
    ${renderFooter(ctx)}
  </article>
  `;
}
