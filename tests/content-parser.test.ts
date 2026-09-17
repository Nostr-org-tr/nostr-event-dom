import { describe, it, expect } from 'vitest';
import {
  isImageUrl,
  isVideoUrl,
  isAudioUrl,
  parseContentNodes,
  renderParsedContentToHtml,
  renderArticleMarkdown
} from '../src/utils/content-parser.js';

describe('Content Parser', () => {
  it('should detect media extensions accurately', () => {
    expect(isImageUrl('https://example.com/pic.jpg')).toBe(true);
    expect(isImageUrl('https://example.com/pic.webp?w=400')).toBe(true);
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);
    expect(isVideoUrl('https://example.com/short.webm')).toBe(true);
    expect(isAudioUrl('https://example.com/podcast.mp3')).toBe(true);
    expect(isImageUrl('https://example.com/page.html')).toBe(false);
  });

  it('should parse URLs, hashtags, and nostr references in text notes', () => {
    const text = 'Hello #nostr! Check out https://example.com and nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6';
    const { nodes } = parseContentNodes(text);

    expect(nodes.some((n) => n.type === 'hashtag' && n.meta?.tag === 'nostr')).toBe(true);
    expect(nodes.some((n) => n.type === 'link' && n.meta?.href === 'https://example.com')).toBe(true);
    expect(nodes.some((n) => n.type === 'nostr_mention')).toBe(true);
  });

  it('should parse embedded media URLs', () => {
    const text = 'Look at this photo https://example.com/photo.png and video https://example.com/video.mp4';
    const { nodes, media } = parseContentNodes(text);

    expect(media.length).toBe(2);
    expect(nodes.some((n) => n.type === 'media' && n.meta?.mediaType === 'image')).toBe(true);
    expect(nodes.some((n) => n.type === 'media' && n.meta?.mediaType === 'video')).toBe(true);
  });

  it('should safely render markdown for articles without XSS vulnerability', () => {
    const markdown = `# Big Article Header\n\nThis is **bold** text and [Link](https://example.com).\n\n<script>alert(1)</script>\n\n> Important quote`;
    const html = renderArticleMarkdown(markdown);

    expect(html).toContain('<h1 class="nostr-article-h1"');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<blockquote class="nostr-article-quote"');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
