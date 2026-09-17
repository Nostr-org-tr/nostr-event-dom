import { escapeHtml } from '../utils/sanitize.js';
import { parseContentNodes, renderParsedContentToHtml } from '../utils/content-parser.js';
import { renderAuthorHeader, renderFooter } from './common.js';
import type { RenderContext } from '../types.js';

/**
 * Fallback renderer for arbitrary or unhandled Nostr event kinds.
 */
export function renderFallback(ctx: RenderContext): string {
  const { event, hideAuthor } = ctx;

  const { nodes } = parseContentNodes(event.content, event.tags);
  const contentHtml = renderParsedContentToHtml(nodes);

  const rawJson = JSON.stringify(event, null, 2);

  return `
  <article class="nostr-card nostr-fallback-card" part="card fallback-card">
    <div class="nostr-kind-badge" part="kind-badge">Kind ${event.kind} Event</div>
    ${!hideAuthor ? renderAuthorHeader(ctx) : ''}
    ${contentHtml ? `<div class="nostr-body nostr-fallback-body" part="body content">${contentHtml}</div>` : ''}
    <details class="nostr-raw-details" part="raw-details">
      <summary style="cursor: pointer; font-size: 12px; color: var(--nostr-text-muted); margin-top: 10px;">View Raw JSON</summary>
      <pre class="nostr-raw-json" part="raw-json"><code>${escapeHtml(rawJson)}</code></pre>
    </details>
    ${renderFooter(ctx)}
  </article>
  `;
}
