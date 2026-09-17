import { parseContentNodes, renderParsedContentToHtml } from '../utils/content-parser.js';
import { renderAuthorHeader, renderFooter } from './common.js';
import type { RenderContext } from '../types.js';

/**
 * Renders Kind 1 Short Text Note.
 */
export function renderNote(ctx: RenderContext): string {
  const { event, hideAuthor, hideMedia } = ctx;

  const { nodes } = parseContentNodes(event.content, event.tags);
  const contentHtml = renderParsedContentToHtml(nodes, {
    renderInlineMedia: !hideMedia
  });

  return `
  <article class="nostr-card nostr-note-card" part="card note-card">
    ${!hideAuthor ? renderAuthorHeader(ctx) : ''}
    <div class="nostr-body nostr-note-body" part="body content">
      ${contentHtml}
    </div>
    ${renderFooter(ctx)}
  </article>
  `;
}
