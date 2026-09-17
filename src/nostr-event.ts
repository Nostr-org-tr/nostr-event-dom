import { parseNostrPointer } from './utils/nip19.js';
import { NostrRelayClient } from './client/relay-pool.js';
import { COMPONENT_STYLES } from './styles/theme.css.js';
import { renderEvent } from './renderers/index.js';
import type { NostrEvent, NostrProfile, DecodedPointer, RenderContext } from './types.js';

const BaseElement =
  typeof globalThis.HTMLElement !== 'undefined'
    ? globalThis.HTMLElement
    : (class {} as typeof HTMLElement);

export class NostrEventElement extends BaseElement {
  public static tagName = 'nostr-event';

  private _event: NostrEvent | null = null;
  private _authorProfile: NostrProfile | null = null;
  private _loading = false;
  private _error: string | null = null;
  private _abortController: AbortController | null = null;
  private _shadow: ShadowRoot;

  public static get observedAttributes(): string[] {
    return ['src', 'relays', 'theme', 'hide-author', 'hide-media', 'event'];
  }

  constructor() {
    super();
    this._shadow =
      typeof (this as any).attachShadow === 'function'
        ? this.attachShadow({ mode: 'open' })
        : ({ innerHTML: '' } as unknown as ShadowRoot);
  }

  public static register(tagName = 'nostr-event'): void {
    if (typeof window !== 'undefined' && 'customElements' in window) {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, NostrEventElement);
      }
    }
  }

  public get src(): string | null {
    return this.getAttribute('src');
  }

  public set src(val: string | null) {
    if (val) {
      this.setAttribute('src', val);
    } else {
      this.removeAttribute('src');
    }
  }

  public get relays(): string[] {
    const raw = this.getAttribute('relays');
    if (!raw) return [];
    return raw
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
  }

  public set relays(val: string[] | string) {
    if (Array.isArray(val)) {
      this.setAttribute('relays', val.join(','));
    } else if (typeof val === 'string') {
      this.setAttribute('relays', val);
    }
  }

  public get event(): NostrEvent | null {
    return this._event;
  }

  public set event(val: NostrEvent | null) {
    this._event = val;
    this._error = null;
    this.render();
    if (val && val.pubkey && val.kind !== 0) {
      this.fetchAuthorProfile(val.pubkey);
    }
  }

  public get authorProfile(): NostrProfile | null {
    return this._authorProfile;
  }

  public set authorProfile(val: NostrProfile | null) {
    this._authorProfile = val;
    this.render();
  }

  public connectedCallback(): void {
    this.load();
  }

  public disconnectedCallback(): void {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'event' && newValue) {
      const trimmed = newValue.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          this.event = JSON.parse(trimmed);
          return;
        } catch {
          // If JSON parse fails, fall through to pointer load
        }
      } else {
        // It is an identifier (e.g. fiatjaf@fiatjaf.com, npub..., note..., etc.)
        this._event = null;
        if (this.isConnected) {
          this.load();
        }
        return;
      }
    }

    if (this.isConnected) {
      this.load();
    }
  }

  /**
   * Resolves the target pointer from either the `event` attribute, `src` attribute, or child <a> fallback.
   */
  private resolvePointer(): DecodedPointer | null {
    let sourceStr = this.getAttribute('event') || this.src;

    if (sourceStr && sourceStr.trim().startsWith('{')) {
      // Direct JSON was supplied
      return null;
    }

    // Progressive enhancement: extract link from fallback light DOM <a> if src/event is missing
    if (!sourceStr) {
      const fallbackLink = this.querySelector('a');
      if (fallbackLink) {
        sourceStr = fallbackLink.getAttribute('href') || fallbackLink.textContent;
      }
    }

    if (!sourceStr) return null;
    return parseNostrPointer(sourceStr);
  }

  /**
   * Loads the event from relays if not provided directly.
   */
  public async load(): Promise<void> {
    const rawEventAttr = this.getAttribute('event');
    if (rawEventAttr && rawEventAttr.trim().startsWith('{')) {
      try {
        this.event = JSON.parse(rawEventAttr);
        return;
      } catch {
        // Continue to pointer resolution if JSON parse fails
      }
    }

    if (this._event) {
      this.render();
      return;
    }

    const pointer = this.resolvePointer();
    if (!pointer) {
      return;
    }

    this._loading = true;
    this._error = null;
    this.renderLoading();

    try {
      const client = NostrRelayClient.getInstance();
      const customRelays = this.relays;

      const event = await client.fetchEvent(pointer, customRelays);

      if (!event) {
        throw new Error('Event not found on queried relays');
      }

      this._event = event;
      this._loading = false;
      this.render();

      this.dispatchEvent(
        new CustomEvent('nostr-load', {
          detail: { event: this._event },
          bubbles: true,
          composed: true
        })
      );

      // Fetch author profile if event is not Kind 0 itself
      if (event.kind !== 0 && event.pubkey) {
        await this.fetchAuthorProfile(event.pubkey);
      }
    } catch (err: any) {
      this._loading = false;
      this._error = err?.message || 'Failed to load Nostr event';
      this.renderError();

      this.dispatchEvent(
        new CustomEvent('nostr-error', {
          detail: { error: this._error },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  private async fetchAuthorProfile(pubkey: string): Promise<void> {
    try {
      const client = NostrRelayClient.getInstance();
      const profile = await client.fetchProfile(pubkey, this.relays);
      if (profile) {
        this._authorProfile = profile;
        this.render();
      }
    } catch {
      // Profile fetch is non-blocking enhancement
    }
  }

  private renderLoading(): void {
    this._shadow.innerHTML = `
      <style>${COMPONENT_STYLES}</style>
      <div class="nostr-loading" part="loading">
        <div class="nostr-spinner"></div>
        <div>Loading Nostr event...</div>
      </div>
    `;
  }

  private renderError(): void {
    const errorMsg = this._error || 'Unable to load Nostr event';
    this._shadow.innerHTML = `
      <style>${COMPONENT_STYLES}</style>
      <div class="nostr-error" part="error">
        <div style="font-weight: 600; margin-bottom: 4px;">Error Loading Event</div>
        <div>${errorMsg}</div>
      </div>
    `;
  }

  private render(): void {
    if (this._loading) {
      this.renderLoading();
      return;
    }

    if (this._error || !this._event) {
      if (this._error) {
        this.renderError();
      }
      return;
    }

    const ctx: RenderContext = {
      event: this._event,
      authorProfile: this._authorProfile || undefined,
      relays: this.relays,
      theme: (this.getAttribute('theme') as any) || 'auto',
      hideAuthor: this.hasAttribute('hide-author'),
      hideMedia: this.hasAttribute('hide-media')
    };

    const renderedHtml = renderEvent(ctx);

    this._shadow.innerHTML = `
      <style>${COMPONENT_STYLES}</style>
      ${renderedHtml}
    `;
  }
}
