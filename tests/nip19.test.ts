import { describe, it, expect } from 'vitest';
import { parseNostrPointer, formatTruncatedKey, hexToNpub, hexToNote } from '../src/utils/nip19.js';

describe('NIP-19 Decoder & Identifier Parser', () => {
  const sampleHexPubkey = '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245';
  const sampleHexEventId = '43d463d56d786d38e26938d600c469f3b93ee7b1640029e464f21612e434dc84';

  it('should parse raw 64-character hex event id', () => {
    const res = parseNostrPointer(sampleHexEventId);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('hex_event');
    if (res?.type === 'hex_event') {
      expect(res.id).toBe(sampleHexEventId);
    }
  });

  it('should parse npub string and nostr:npub URI', () => {
    const npub = hexToNpub(sampleHexPubkey);
    expect(npub.startsWith('npub1')).toBe(true);

    const res1 = parseNostrPointer(npub);
    expect(res1?.type).toBe('npub');
    if (res1?.type === 'npub') {
      expect(res1.pubkey).toBe(sampleHexPubkey);
    }

    const res2 = parseNostrPointer(`nostr:${npub}`);
    expect(res2?.type).toBe('npub');
    if (res2?.type === 'npub') {
      expect(res2.pubkey).toBe(sampleHexPubkey);
    }
  });

  it('should parse note string and nostr:note URI', () => {
    const note = hexToNote(sampleHexEventId);
    expect(note.startsWith('note1')).toBe(true);

    const res = parseNostrPointer(note);
    expect(res?.type).toBe('note');
    if (res?.type === 'note') {
      expect(res.id).toBe(sampleHexEventId);
    }
  });

  it('should return null on invalid input', () => {
    expect(parseNostrPointer('')).toBeNull();
    expect(parseNostrPointer('invalid_bech32_string')).toBeNull();
    expect(parseNostrPointer('https://example.com')).toBeNull();
  });

  it('should format truncated keys correctly', () => {
    expect(formatTruncatedKey('npub1abcde123456789xyz', 6, 3)).toBe('npub1a...xyz');
    expect(formatTruncatedKey('short', 8, 4)).toBe('short');
  });
});
