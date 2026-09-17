import { escapeHtml, sanitizeUrl, sanitizeMediaUrl } from './sanitize.js';
import { parseNostrPointer, formatTruncatedKey } from './nip19.js';
import type { ParsedContentNode, ParsedMediaItem } from '../types.js';

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|avif)($|\?)/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)($|\?)/i;
const AUDIO_EXTENSIONS = /\.(mp3|ogg|wav|m4a|aac)($|\?)/i;

/**
 * Checks if a URL points to an image.
 */
export function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.test(url);
}

/**
 * Checks if a URL points to a video file.
 */
export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url);
}

/**
 * Checks if a URL points to an audio file.
 */
export function isAudioUrl(url: string): boolean {
  return AUDIO_EXTENSIONS.test(url);
}

/**
 * Parses raw text content into tokens for notes and descriptions.
 */
export function parseContentNodes(
  content: string,
  tags: string[][] = []
): { nodes: ParsedContentNode[]; media: ParsedMediaItem[] } {
  if (!content) return { nodes: [], media: [] };

  // Replace NIP-08 positional mentions like #[0] with corresponding tag if available
  let processed = content.replace(/#\[(\d+)\]/g, (match, indexStr) => {
    const idx = parseInt(indexStr, 10);
    const tag = tags[idx];
    if (tag) {
      if (tag[0] === 'e') {
        return `nostr:${tag[1]}`;
      } else if (tag[0] === 'p') {
        return `nostr:${tag[1]}`;
      }
    }
    return match;
  });

  const nodes: ParsedContentNode[] = [];
  const media: ParsedMediaItem[] = [];

  // Regex pattern matching URLs, nostr: references, hashtags, and code blocks
  const tokenRegex = /(```[\s\S]*?```|`[^`]+`)|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(nostr:[a-zA-Z0-9_]+)|(#[a-zA-Z0-9_\p{L}]+)/gu;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(processed)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = processed.substring(lastIndex, match.index);
      nodes.push({ type: 'text', value: textChunk });
    }

    const [fullMatch, codeBlock, urlMatch, nostrMatch, hashtagMatch] = match;

    if (codeBlock) {
      if (codeBlock.startsWith('```')) {
        const raw = codeBlock.slice(3, -3);
        const firstLineEnd = raw.indexOf('\n');
        let lang = '';
        let code = raw;
        if (firstLineEnd !== -1) {
          lang = raw.slice(0, firstLineEnd).trim();
          code = raw.slice(firstLineEnd + 1);
        }
        nodes.push({
          type: 'code',
          value: code,
          meta: { language: lang }
        });
      } else {
        nodes.push({
          type: 'code',
          value: codeBlock.slice(1, -1),
          meta: { language: 'inline' }
        });
      }
    } else if (urlMatch) {
      const safeUrl = sanitizeUrl(urlMatch);
      if (safeUrl) {
        if (isImageUrl(safeUrl)) {
          media.push({ type: 'image', url: safeUrl });
          nodes.push({
            type: 'media',
            value: safeUrl,
            meta: { href: safeUrl, mediaType: 'image' }
          });
        } else if (isVideoUrl(safeUrl)) {
          media.push({ type: 'video', url: safeUrl });
          nodes.push({
            type: 'media',
            value: safeUrl,
            meta: { href: safeUrl, mediaType: 'video' }
          });
        } else if (isAudioUrl(safeUrl)) {
          media.push({ type: 'audio', url: safeUrl });
          nodes.push({
            type: 'media',
            value: safeUrl,
            meta: { href: safeUrl, mediaType: 'audio' }
          });
        } else {
          nodes.push({
            type: 'link',
            value: urlMatch,
            meta: { href: safeUrl }
          });
        }
      } else {
        nodes.push({ type: 'text', value: urlMatch });
      }
    } else if (nostrMatch) {
      const parsedPointer = parseNostrPointer(nostrMatch);
      nodes.push({
        type: 'nostr_mention',
        value: nostrMatch,
        meta: {
          href: sanitizeUrl(nostrMatch),
          decoded: parsedPointer || undefined
        }
      });
    } else if (hashtagMatch) {
      const tag = hashtagMatch.slice(1);
      nodes.push({
        type: 'hashtag',
        value: hashtagMatch,
        meta: { tag }
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < processed.length) {
    nodes.push({
      type: 'text',
      value: processed.substring(lastIndex)
    });
  }

  return { nodes, media };
}

/**
 * Renders parsed content nodes to safe HTML string.
 */
export function renderParsedContentToHtml(
  nodes: ParsedContentNode[],
  options: { renderInlineMedia?: boolean } = {}
): string {
  const { renderInlineMedia = true } = options;

  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.value).replace(/\n/g, '<br />');

        case 'link': {
          const href = sanitizeUrl(node.meta?.href || node.value);
          if (!href) return escapeHtml(node.value);
          return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow" class="nostr-link" part="link">${escapeHtml(node.value)}</a>`;
        }

        case 'nostr_mention': {
          const href = sanitizeUrl(node.meta?.href || node.value);
          const pointer = node.meta?.decoded;
          let label = node.value;

          if (pointer) {
            if (pointer.type === 'npub' || pointer.type === 'nprofile') {
              label = `@${formatTruncatedKey(pointer.pubkey, 8, 4)}`;
            } else if (pointer.type === 'note' || pointer.type === 'nevent') {
              label = `⚡${formatTruncatedKey(pointer.id, 8, 4)}`;
            } else if (pointer.type === 'naddr') {
              label = `📑 ${escapeHtml(pointer.identifier)}`;
            }
          }

          return `<a href="${escapeHtml(href)}" class="nostr-mention" part="mention" data-nostr-uri="${escapeHtml(node.value)}">${escapeHtml(label)}</a>`;
        }

        case 'hashtag': {
          const tag = node.meta?.tag || '';
          return `<a href="nostr:search?q=%23${encodeURIComponent(tag)}" class="nostr-hashtag" part="hashtag">${escapeHtml(node.value)}</a>`;
        }

        case 'code': {
          if (node.meta?.language === 'inline') {
            return `<code class="nostr-inline-code" part="code-inline">${escapeHtml(node.value)}</code>`;
          }
          const langClass = node.meta?.language ? ` language-${escapeHtml(node.meta.language)}` : '';
          return `<pre class="nostr-code-block${langClass}" part="code-block"><code>${escapeHtml(node.value)}</code></pre>`;
        }

        case 'media': {
          if (!renderInlineMedia) {
            const href = sanitizeUrl(node.value);
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow" class="nostr-link" part="link">${escapeHtml(node.value)}</a>`;
          }

          const mediaType = node.meta?.mediaType;
          const safeUrl = sanitizeMediaUrl(node.value);
          if (!safeUrl) return '';

          if (mediaType === 'image') {
            return `<div class="nostr-media-embed" part="media-embed">
              <img src="${escapeHtml(safeUrl)}" alt="Attached image" loading="lazy" class="nostr-media-image" part="media-image" />
            </div>`;
          } else if (mediaType === 'video') {
            return `<div class="nostr-media-embed" part="media-embed">
              <video src="${escapeHtml(safeUrl)}" controls preload="metadata" class="nostr-media-video" part="media-video"></video>
            </div>`;
          } else if (mediaType === 'audio') {
            return `<div class="nostr-media-embed" part="media-embed">
              <audio src="${escapeHtml(safeUrl)}" controls preload="metadata" class="nostr-media-audio" part="media-audio"></audio>
            </div>`;
          }
          return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="nostr-link">${escapeHtml(node.value)}</a>`;
        }

        default:
          return escapeHtml(node.value);
      }
    })
    .join('');
}

/**
 * Lightweight safe markdown renderer for Kind 30023 long-form articles.
 * Strictly sanitizes HTML and renders headers, bold, italics, links, blockquotes, lists, and code blocks.
 */
export function renderArticleMarkdown(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const output: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        output.push(`<pre class="nostr-article-code" part="code-block"><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) {
          output.push('</ul>');
          inList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // List item handling
    const listMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        output.push('<ul class="nostr-article-list" part="list">');
        inList = true;
      }
      output.push(`<li>${renderInlineMarkdown(listMatch[2])}</li>`);
      continue;
    } else if (inList) {
      output.push('</ul>');
      inList = false;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      output.push(`<h${level} class="nostr-article-h${level}" part="heading">${renderInlineMarkdown(headerMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      output.push(`<blockquote class="nostr-article-quote" part="blockquote">${renderInlineMarkdown(quoteMatch[1])}</blockquote>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Standard paragraph
    output.push(`<p class="nostr-article-p" part="paragraph">${renderInlineMarkdown(line)}</p>`);
  }

  if (inCodeBlock) {
    output.push(`<pre class="nostr-article-code"><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}

/**
 * Handles inline markdown (bold, italic, links, images, code).
 */
function renderInlineMarkdown(text: string): string {
  let res = escapeHtml(text);

  // Images: ![alt](url)
  res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const safeUrl = sanitizeMediaUrl(url);
    if (!safeUrl) return '';
    return `<figure class="nostr-article-media"><img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(alt)}" loading="lazy" class="nostr-article-img" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
  });

  // Links: [title](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, title, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return title;
    return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="nostr-link">${title}</a>`;
  });

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="nostr-inline-code">$1</code>');

  // Bold: **text** or __text__
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  res = res.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Nostr mentions: nostr:nevent1... or nostr:npub1...
  res = res.replace(/(nostr:[a-zA-Z0-9_]+)/g, (match) => {
    const pointer = parseNostrPointer(match);
    let label = match;
    if (pointer) {
      if (pointer.type === 'npub' || pointer.type === 'nprofile') {
        label = `@${formatTruncatedKey(pointer.pubkey, 8, 4)}`;
      } else if (pointer.type === 'note' || pointer.type === 'nevent') {
        label = `⚡${formatTruncatedKey(pointer.id, 8, 4)}`;
      }
    }
    return `<a href="${escapeHtml(sanitizeUrl(match))}" class="nostr-mention" data-nostr-uri="${escapeHtml(match)}">${escapeHtml(label)}</a>`;
  });

  return res;
}
