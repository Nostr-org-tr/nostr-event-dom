import { describe, it, expect } from 'vitest';
import { renderEvent } from '../src/renderers/index.js';
import type { NostrEvent, RenderContext } from '../src/types.js';

describe('Event Renderers', () => {
  const mockPubkey = '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245';

  it('renders Kind 0 Profile correctly', () => {
    const event: NostrEvent = {
      id: 'abc1',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 0,
      tags: [],
      content: JSON.stringify({
        name: 'satoshi',
        display_name: 'Satoshi Nakamoto',
        about: 'Building decentralized money.',
        nip05: 'satoshi@bitcoin.org',
        lud16: 'satoshi@walletofsatoshi.com'
      }),
      sig: 'sig'
    };

    const ctx: RenderContext = { event, relays: [] };
    const html = renderEvent(ctx);

    expect(html).toContain('Satoshi Nakamoto');
    expect(html).toContain('satoshi@bitcoin.org');
    expect(html).toContain('Building decentralized money.');
    expect(html).toContain('nostr-profile-card');
  });

  it('renders Kind 1 Note with mentions and links', () => {
    const event: NostrEvent = {
      id: 'abc2',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 1,
      tags: [],
      content: 'Just launched our new Nostr web component! #nostr https://example.com',
      sig: 'sig'
    };

    const ctx: RenderContext = {
      event,
      relays: [],
      authorProfile: { name: 'satoshi', display_name: 'Satoshi' }
    };
    const html = renderEvent(ctx);

    expect(html).toContain('nostr-note-card');
    expect(html).toContain('Just launched our new Nostr web component!');
    expect(html).toContain('class="nostr-hashtag"');
    expect(html).toContain('https://example.com');
  });

  it('renders Kind 30023 Long-form Article', () => {
    const event: NostrEvent = {
      id: 'abc3',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 30023,
      tags: [
        ['d', 'intro-to-nostr'],
        ['title', 'Introduction to Nostr'],
        ['summary', 'A deep dive into decentralized social protocols.'],
        ['image', 'https://example.com/cover.jpg'],
        ['t', 'nostr'],
        ['t', 'bitcoin']
      ],
      content: '## What is Nostr?\n\nNostr is an open protocol for censorship-resistant global social networks.',
      sig: 'sig'
    };

    const ctx: RenderContext = { event, relays: [] };
    const html = renderEvent(ctx);

    expect(html).toContain('nostr-article-card');
    expect(html).toContain('Introduction to Nostr');
    expect(html).toContain('A deep dive into decentralized social protocols.');
    expect(html).toContain('What is Nostr?');
  });

  it('renders Kind 31923 Calendar Event', () => {
    const event: NostrEvent = {
      id: 'abc4',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 31923,
      tags: [
        ['d', 'nostr-hackathon-2026'],
        ['name', 'Nostr Global Hackathon'],
        ['start', '1773792000'],
        ['end', '1773964800'],
        ['location', 'Lisbon, Portugal']
      ],
      content: 'Join us for 48 hours of building decentralized Nostr apps!',
      sig: 'sig'
    };

    const ctx: RenderContext = { event, relays: [] };
    const html = renderEvent(ctx);

    expect(html).toContain('nostr-event-calendar');
    expect(html).toContain('Nostr Global Hackathon');
    expect(html).toContain('Lisbon, Portugal');
    expect(html).toContain('Join us for 48 hours');
  });

  it('renders Kind 20 Photo and Kind 21 Video Media', () => {
    const photoEvent: NostrEvent = {
      id: 'abc5',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 20,
      tags: [
        ['url', 'https://example.com/photo.jpg'],
        ['title', 'Sunset in the Mountains'],
        ['alt', 'A beautiful mountain sunset']
      ],
      content: 'Sunset from today hike!',
      sig: 'sig'
    };

    const photoHtml = renderEvent({ event: photoEvent, relays: [] });
    expect(photoHtml).toContain('nostr-media-card');
    expect(photoHtml).toContain('Sunset in the Mountains');
    expect(photoHtml).toContain('https://example.com/photo.jpg');

    const videoEvent: NostrEvent = {
      id: 'abc6',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 21,
      tags: [
        ['url', 'https://example.com/video.mp4'],
        ['thumb', 'https://example.com/poster.jpg'],
        ['title', 'Keynote Speech']
      ],
      content: 'Opening keynote video recording.',
      sig: 'sig'
    };

    const videoHtml = renderEvent({ event: videoEvent, relays: [] });
    expect(videoHtml).toContain('nostr-video-player');
    expect(videoHtml).toContain('https://example.com/video.mp4');
    expect(videoHtml).toContain('Keynote Speech');
  });

  it('renders generic fallback for unknown kind', () => {
    const event: NostrEvent = {
      id: 'abc99',
      pubkey: mockPubkey,
      created_at: 1700000000,
      kind: 9999,
      tags: [['t', 'custom']],
      content: 'Custom experimental event data',
      sig: 'sig'
    };

    const ctx: RenderContext = { event, relays: [] };
    const html = renderEvent(ctx);

    expect(html).toContain('nostr-fallback-card');
    expect(html).toContain('Kind 9999 Event');
    expect(html).toContain('Custom experimental event data');
    expect(html).toContain('View Raw JSON');
  });
});
