import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NostrEvent } from '../src/types.js';

// Setup minimal DOM mocks in Node.js environment
if (typeof globalThis.HTMLElement === 'undefined') {
  class MockElement {
    private attrs = new Map<string, string>();
    public shadowRoot: any = { innerHTML: '' };
    public isConnected = true;

    attachShadow(_init: any) {
      return this.shadowRoot;
    }

    getAttribute(name: string): string | null {
      return this.attrs.get(name) || null;
    }

    setAttribute(name: string, value: string): void {
      const old = this.getAttribute(name);
      this.attrs.set(name, value);
      if (typeof (this as any).attributeChangedCallback === 'function') {
        (this as any).attributeChangedCallback(name, old, value);
      }
    }

    removeAttribute(name: string): void {
      const old = this.getAttribute(name);
      this.attrs.delete(name);
      if (typeof (this as any).attributeChangedCallback === 'function') {
        (this as any).attributeChangedCallback(name, old, null);
      }
    }

    hasAttribute(name: string): boolean {
      return this.attrs.has(name);
    }

    querySelector(_selector: string): any {
      return null;
    }

    dispatchEvent(_event: any): boolean {
      return true;
    }
  }

  (globalThis as any).HTMLElement = MockElement;
}

if (typeof globalThis.customElements === 'undefined') {
  const registry = new Map<string, any>();
  (globalThis as any).customElements = {
    get: (name: string) => registry.get(name),
    define: (name: string, ctor: any) => registry.set(name, ctor)
  };
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

if (typeof globalThis.CustomEvent === 'undefined') {
  class MockCustomEvent {
    constructor(public type: string, public init?: any) {}
  }
  (globalThis as any).CustomEvent = MockCustomEvent;
}

describe('NostrEventElement Web Component', async () => {
  const { NostrEventElement } = await import('../src/nostr-event.js');
  const { NostrRelayClient } = await import('../src/client/relay-pool.js');

  beforeEach(() => {
    vi.spyOn(NostrRelayClient.prototype, 'fetchEvent').mockResolvedValue(null);
    vi.spyOn(NostrRelayClient.prototype, 'fetchProfile').mockResolvedValue(null);
  });

  it('registers custom element cleanly', () => {
    NostrEventElement.register('nostr-event-test');
    expect(customElements.get('nostr-event-test')).toBe(NostrEventElement);
  });

  it('manages attributes and observed attributes correctly', () => {
    expect(NostrEventElement.observedAttributes).toContain('src');
    expect(NostrEventElement.observedAttributes).toContain('relays');
    expect(NostrEventElement.observedAttributes).toContain('event');
    expect(NostrEventElement.observedAttributes).toContain('theme');
    expect(NostrEventElement.observedAttributes).toContain('hide-author');
    expect(NostrEventElement.observedAttributes).toContain('hide-media');

    const el = new NostrEventElement();
    el.src = 'nevent1qqs...';
    expect(el.src).toBe('nevent1qqs...');
    expect(el.getAttribute('src')).toBe('nevent1qqs...');

    el.relays = ['wss://relay.damus.io', 'wss://nos.lol'];
    expect(el.relays).toEqual(['wss://relay.damus.io', 'wss://nos.lol']);
  });

  it('renders static event directly when assigned to .event property', () => {
    const el = new NostrEventElement();
    const sampleEvent: NostrEvent = {
      id: 'abc001',
      pubkey: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
      created_at: 1700000000,
      kind: 1,
      tags: [],
      content: 'Testing web component rendering',
      sig: 'sig'
    };

    el.event = sampleEvent;
    expect(el.event).toEqual(sampleEvent);
    expect((el as any)._shadow.innerHTML).toContain('Testing web component rendering');
    expect((el as any)._shadow.innerHTML).toContain('nostr-note-card');
  });

  it('parses JSON string from event attribute', () => {
    const el = new NostrEventElement();
    const sampleEvent: NostrEvent = {
      id: 'abc002',
      pubkey: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
      created_at: 1700000000,
      kind: 1,
      tags: [],
      content: 'Event parsed from attribute string',
      sig: 'sig'
    };

    el.setAttribute('event', JSON.stringify(sampleEvent));
    expect((el as any)._shadow.innerHTML).toContain('Event parsed from attribute string');
  });
});
