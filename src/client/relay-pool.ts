import { SimplePool } from 'nostr-tools';
import { queryProfileNip05 } from '../utils/nip05.js';
import type { NostrEvent, NostrProfile, DecodedPointer } from '../types.js';

export const DEFAULT_RELAYS: string[] = [
  'wss://purplepag.es',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://nostr.mom'
];

export class NostrRelayClient {
  private static instance: NostrRelayClient;
  private pool: SimplePool;
  private eventCache = new Map<string, NostrEvent>();
  private profileCache = new Map<string, NostrProfile>();
  private pendingEventRequests = new Map<string, Promise<NostrEvent | null>>();
  private pendingProfileRequests = new Map<string, Promise<NostrProfile | null>>();

  private constructor() {
    this.pool = new SimplePool();
  }

  public static getInstance(): NostrRelayClient {
    if (!NostrRelayClient.instance) {
      NostrRelayClient.instance = new NostrRelayClient();
    }
    return NostrRelayClient.instance;
  }

  /**
   * Combines user-provided relays with decoded pointer relays and default fallbacks.
   */
  public resolveRelays(customRelays: string[] = [], pointerRelays: string[] = []): string[] {
    const combined = [...customRelays, ...pointerRelays, ...DEFAULT_RELAYS];
    const unique = Array.from(
      new Set(
        combined
          .filter((r) => typeof r === 'string' && (r.startsWith('wss://') || r.startsWith('ws://')))
          .map((r) => r.trim())
      )
    );
    return unique.length > 0 ? unique : DEFAULT_RELAYS;
  }

  /**
   * Fetches a Nostr event by its decoded pointer with timeout and multi-relay querying.
   */
  public async fetchEvent(
    pointer: DecodedPointer,
    customRelays: string[] = [],
    timeoutMs = 5000
  ): Promise<NostrEvent | null> {
    const cacheKey = this.getPointerCacheKey(pointer);
    if (this.eventCache.has(cacheKey)) {
      return this.eventCache.get(cacheKey)!;
    }

    if (this.pendingEventRequests.has(cacheKey)) {
      return this.pendingEventRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const relays = this.resolveRelays(customRelays, pointer.relays);

      let filter: any;
      if (pointer.type === 'nip05') {
        const resolved = await queryProfileNip05(pointer.nip05, timeoutMs);
        if (!resolved) return null;
        pointer.pubkey = resolved.pubkey;
        if (resolved.relays) {
          pointer.relays = resolved.relays;
        }
        filter = { kinds: [0], authors: [resolved.pubkey] };
      } else if (pointer.type === 'note' || pointer.type === 'nevent' || pointer.type === 'hex_event') {
        filter = { ids: [pointer.id] };
      } else if (pointer.type === 'npub' || pointer.type === 'nprofile' || pointer.type === 'hex_pubkey') {
        filter = { kinds: [0], authors: [pointer.pubkey] };
      } else if (pointer.type === 'naddr') {
        filter = {
          kinds: [pointer.kind],
          authors: [pointer.pubkey],
          '#d': [pointer.identifier]
        };
      } else {
        return null;
      }

      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs)
        );

        const fetchPromise = this.pool.get(relays, filter);
        const event = (await Promise.race([fetchPromise, timeoutPromise])) as NostrEvent | null;

        if (event) {
          this.eventCache.set(cacheKey, event);
          if (event.id) this.eventCache.set(event.id, event);
        }

        return event;
      } catch (err) {
        console.warn('[nostr-event-dom] Failed to fetch event:', err);
        return null;
      } finally {
        this.pendingEventRequests.delete(cacheKey);
      }
    })();

    this.pendingEventRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Fetches user profile metadata (Kind 0) for a given public key.
   */
  public async fetchProfile(
    pubkey: string,
    customRelays: string[] = [],
    timeoutMs = 4000
  ): Promise<NostrProfile | null> {
    if (!pubkey) return null;

    if (this.profileCache.has(pubkey)) {
      return this.profileCache.get(pubkey)!;
    }

    if (this.pendingProfileRequests.has(pubkey)) {
      return this.pendingProfileRequests.get(pubkey)!;
    }

    const requestPromise = (async () => {
      const relays = this.resolveRelays(customRelays);

      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs)
        );

        const fetchPromise = this.pool.get(relays, {
          kinds: [0],
          authors: [pubkey]
        });

        const event = (await Promise.race([fetchPromise, timeoutPromise])) as NostrEvent | null;

        if (event && event.content) {
          try {
            const parsed = JSON.parse(event.content) as NostrProfile;
            this.profileCache.set(pubkey, parsed);
            return parsed;
          } catch {
            return null;
          }
        }
        return null;
      } catch (err) {
        console.warn('[nostr-event-dom] Failed to fetch profile:', err);
        return null;
      } finally {
        this.pendingProfileRequests.delete(pubkey);
      }
    })();

    this.pendingProfileRequests.set(pubkey, requestPromise);
    return requestPromise;
  }

  /**
   * Manually prime cache with an event.
   */
  public setCachedEvent(event: NostrEvent): void {
    if (event && event.id) {
      this.eventCache.set(event.id, event);
    }
  }

  /**
   * Manually prime cache with a profile.
   */
  public setCachedProfile(pubkey: string, profile: NostrProfile): void {
    if (pubkey && profile) {
      this.profileCache.set(pubkey, profile);
    }
  }

  public close(): void {
    this.pool.close(DEFAULT_RELAYS);
  }

  private getPointerCacheKey(pointer: DecodedPointer): string {
    if ('id' in pointer && pointer.id) return pointer.id;
    if (pointer.type === 'naddr') return `${pointer.kind}:${pointer.pubkey}:${pointer.identifier}`;
    if ('pubkey' in pointer && pointer.pubkey) return `profile:${pointer.pubkey}`;
    return JSON.stringify(pointer);
  }
}
