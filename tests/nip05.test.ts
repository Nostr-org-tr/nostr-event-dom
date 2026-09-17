import { describe, it, expect, vi } from 'vitest';
import { isNip05, queryProfileNip05 } from '../src/utils/nip05.js';
import { parseNostrPointer } from '../src/utils/nip19.js';

describe('NIP-05 Identifier & Resolver', () => {
  it('should validate NIP-05 formatting', () => {
    expect(isNip05('fiatjaf@fiatjaf.com')).toBe(true);
    expect(isNip05('alex_123@domain.org')).toBe(true);
    expect(isNip05('_@my-domain.co')).toBe(true);
    expect(isNip05('invalid nip05')).toBe(false);
    expect(isNip05('npub12345')).toBe(false);
  });

  it('should parse NIP-05 pointers via parseNostrPointer', () => {
    const isVal = isNip05('fiatjaf@fiatjaf.com');
    expect(isVal).toBe(true);

    const pointer = parseNostrPointer('fiatjaf@fiatjaf.com');
    expect(pointer).toEqual({
      type: 'nip05',
      nip05: 'fiatjaf@fiatjaf.com'
    });
  });

  it('should query and resolve NIP-05 endpoints', async () => {
    const mockPubkey = '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          testuser: mockPubkey
        },
        relays: {
          [mockPubkey]: ['wss://relay.damus.io']
        }
      })
    });

    global.fetch = mockFetch as any;

    const result = await queryProfileNip05('testuser@example.com');
    expect(result).not.toBeNull();
    expect(result?.pubkey).toBe(mockPubkey);
    expect(result?.relays).toEqual(['wss://relay.damus.io']);

    // Test fallback with root _
    const mockRootFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          _: mockPubkey
        }
      })
    });
    global.fetch = mockRootFetch as any;
    const rootResult = await queryProfileNip05('fiatjaf@fiatjaf.com');
    expect(rootResult).not.toBeNull();
    expect(rootResult?.pubkey).toBe(mockPubkey);
  });
});
