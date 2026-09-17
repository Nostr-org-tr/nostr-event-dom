export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

export interface NostrProfile {
  name?: string;
  display_name?: string;
  displayName?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
  website?: string;
  nip05valid?: boolean;
}

export type DecodedPointer =
  | { type: 'note'; id: string; relays?: string[] }
  | { type: 'npub'; pubkey: string; relays?: string[] }
  | { type: 'nevent'; id: string; relays?: string[]; author?: string; kind?: number }
  | { type: 'nprofile'; pubkey: string; relays?: string[] }
  | { type: 'naddr'; identifier: string; pubkey: string; kind: number; relays?: string[] }
  | { type: 'nip05'; nip05: string; pubkey?: string; relays?: string[] }
  | { type: 'hex_event'; id: string; relays?: string[] }
  | { type: 'hex_pubkey'; pubkey: string; relays?: string[] };

export interface RenderContext {
  event: NostrEvent;
  authorProfile?: NostrProfile;
  relays: string[];
  theme?: 'light' | 'dark' | 'auto';
  hideAuthor?: boolean;
  hideMedia?: boolean;
  compact?: boolean;
  onNostrLinkClick?: (uri: string, event: MouseEvent) => void;
}

export interface ParsedMediaItem {
  type: 'image' | 'video' | 'audio';
  url: string;
}

export interface ParsedContentNode {
  type: 'text' | 'link' | 'nostr_mention' | 'hashtag' | 'media' | 'code' | 'newline';
  value: string;
  meta?: {
    href?: string;
    mediaType?: 'image' | 'video' | 'audio';
    tag?: string;
    decoded?: DecodedPointer;
    language?: string;
  };
}

export interface CalendarEventData {
  title: string;
  summary?: string;
  description?: string;
  location?: string;
  start: number; // Unix timestamp in seconds
  end?: number; // Unix timestamp in seconds
  startTzid?: string;
  endTzid?: string;
  image?: string;
  hashtags: string[];
}

export interface MediaEventData {
  url: string;
  mediaType: 'image' | 'video' | 'short';
  title?: string;
  summary?: string;
  blurhash?: string;
  dim?: string; // e.g. "1920x1080"
  duration?: number; // seconds
  mimeType?: string;
  alt?: string;
  fallbackUrls?: string[];
}
