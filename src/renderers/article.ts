import { escapeHtml, sanitizeMediaUrl } from '../utils/sanitize.js';
import { renderArticleMarkdown } from '../utils/content-parser.js';
import { renderAuthorHeader, renderFooter } from './common.js';
import type { RenderContext } from '../types.js';

/**
 * Renders Kind 30023 Long-form Article (NIP-23).
 */
export function renderArticle(ctx: RenderContext): string {
  const { event, hideAuthor } = ctx;

  const tagMap = new Map<string, string>();
  const topics: string[] = [];

  for (const tag of event.tags) {
    if (!tag || tag.length < 2) continue;
    if (tag[0] === 't') {
      topics.push(tag[1]);
    } else if (!tagMap.has(tag[0])) {
      tagMap.set(tag[0], tag[1]);
    }
  }

  const title = tagMap.get('title') || 'Untitled Article';
  const summary = tagMap.get('summary') || '';
  const image = tagMap.get('image') ? sanitizeMediaUrl(tagMap.get('image')!) : '';
  const bodyHtml = renderArticleMarkdown(event.content);

  return `
  <article class="nostr-card nostr-article-card" part="card article-card">
    ${
      image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="nostr-article-cover" part="article-cover" loading="lazy" />`
        : ''
    }
    <div class="nostr-article-header" part="article-header">
      <h1 class="nostr-article-title" part="article-title">${escapeHtml(title)}</h1>
      ${summary ? `<p class="nostr-article-summary" part="article-summary">${escapeHtml(summary)}</p>` : ''}
    </div>
    ${!hideAuthor ? renderAuthorHeader(ctx) : ''}
    <div class="nostr-article-body" part="article-body">
      ${bodyHtml}
    </div>
    ${
      topics.length > 0
        ? `<div class="nostr-article-tags" part="article-tags">
            ${topics
              .map(
                (t) =>
                  `<a href="nostr:search?q=%23${encodeURIComponent(t)}" class="nostr-hashtag" part="hashtag">#${escapeHtml(t)}</a>`
              )
              .join(' ')}
          </div>`
        : ''
    }
    ${renderFooter(ctx)}
  </article>
  `;
}
