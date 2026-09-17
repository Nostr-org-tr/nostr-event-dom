import { nip19 } from 'nostr-tools';
import { isNip05 } from './nip05.js';
import type { DecodedPointer } from '../types.js';

/**
 * Parses any Nostr URI or bech32 string (npub, note, nevent, nprofile, naddr, hex, NIP-05)
 * into a structured DecodedPointer.
 */
export function parseNostrPointer(input: string): DecodedPointer | null {
  if (!input || typeof input !== 'string') return null;

  let cleaned = input.trim();

  // Strip nostr: prefix or web+nostr: if present
  if (cleaned.startsWith('nostr:')) {
    cleaned = cleaned.slice(6);
  } else if (cleaned.startsWith('web+nostr:')) {
    cleaned = cleaned.slice(10);
  }

  // Strip query parameters or trailing slashes
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/+$/, '');

  // Check NIP-05 identifier (e.g. user@domain.com)
  if (isNip05(cleaned)) {
    return {
      type: 'nip05',
      nip05: cleaned.toLowerCase()
    };
  }

  // Check 64-char hex string (event ID or pubkey)
  if (/^[0-9a-fA-F]{64}$/.test(cleaned)) {
    return {
      type: 'hex_event',
      id: cleaned.toLowerCase()
    };
  }

  // Parse NIP-19 bech32 entity
  try {
    const decoded = nip19.decode(cleaned);

    switch (decoded.type) {
      case 'note':
        return {
          type: 'note',
          id: decoded.data
        };
      case 'npub':
        return {
          type: 'npub',
          pubkey: decoded.data
        };
      case 'nevent':
        return {
          type: 'nevent',
          id: decoded.data.id,
          relays: decoded.data.relays,
          author: decoded.data.author,
          kind: decoded.data.kind
        };
      case 'nprofile':
        return {
          type: 'nprofile',
          pubkey: decoded.data.pubkey,
          relays: decoded.data.relays
        };
      case 'naddr':
        return {
          type: 'naddr',
          identifier: decoded.data.identifier,
          pubkey: decoded.data.pubkey,
          kind: decoded.data.kind,
          relays: decoded.data.relays
        };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Formats a pubkey or event ID into a truncated string (e.g. npub1...abcd).
 */
export function formatTruncatedKey(key: string, prefixLen = 8, suffixLen = 4): string {
  if (!key) return '';
  if (key.length <= prefixLen + suffixLen + 3) return key;
  return `${key.slice(0, prefixLen)}...${key.slice(-suffixLen)}`;
}

/**
 * Converts a hex pubkey to npub string safely.
 */
export function hexToNpub(hexPubkey: string): string {
  try {
    return nip19.npubEncode(hexPubkey);
  } catch {
    return hexPubkey;
  }
}

/**
 * Converts a hex event ID to note string safely.
 */
export function hexToNote(hexId: string): string {
  try {
    return nip19.noteEncode(hexId);
  } catch {
    return hexId;
  }
}
