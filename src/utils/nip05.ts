const NIP05_REGEX = /^([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

export interface Nip05Profile {
  pubkey: string;
  relays?: string[];
}

const nip05Cache = new Map<string, Nip05Profile | null>();

/**
 * Checks if a string matches a NIP-05 address format (name@domain.tld).
 */
export function isNip05(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return NIP05_REGEX.test(input.trim());
}

/**
 * Resolves a NIP-05 identifier (e.g. user@domain.com or _@domain.com)
 * by fetching https://<domain>/.well-known/nostr.json?name=<name>
 */
export async function queryProfileNip05(nip05: string, timeoutMs = 4000): Promise<Nip05Profile | null> {
  const trimmed = nip05.trim().toLowerCase();
  const match = trimmed.match(NIP05_REGEX);
  if (!match) return null;

  if (nip05Cache.has(trimmed)) {
    return nip05Cache.get(trimmed)!;
  }

  const [_, name, domain] = match;
  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timer);

    if (!response.ok) {
      nip05Cache.set(trimmed, null);
      return null;
    }

    const data = await response.json();
    const names = data?.names;
    if (!names || typeof names !== 'object') {
      nip05Cache.set(trimmed, null);
      return null;
    }

    // Check exact name, lowercased name, or root '_' fallback
    const domainBase = domain.split('.')[0].toLowerCase();
    const pubkey =
      names[name] ||
      names[name.toLowerCase()] ||
      (name === domainBase || name === '_' ? names['_'] : undefined) ||
      names['_'];

    if (!pubkey || !/^[0-9a-fA-F]{64}$/.test(pubkey)) {
      nip05Cache.set(trimmed, null);
      return null;
    }

    const relays: string[] = [];
    if (data?.relays?.[pubkey] && Array.isArray(data.relays[pubkey])) {
      relays.push(...data.relays[pubkey]);
    }

    const result: Nip05Profile = {
      pubkey: pubkey.toLowerCase(),
      relays: relays.length > 0 ? relays : undefined
    };

    nip05Cache.set(trimmed, result);
    return result;
  } catch {
    nip05Cache.set(trimmed, null);
    return null;
  }
}
