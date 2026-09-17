import { NostrEventElement } from './nostr-event.js';

// Auto-register custom element in browser environments
NostrEventElement.register();

export { NostrEventElement };
export * from './types.js';
export * from './utils/nip19.js';
export * from './utils/nip05.js';
export * from './utils/sanitize.js';
export * from './utils/content-parser.js';
export * from './client/relay-pool.js';
export * from './styles/theme.css.js';
export * from './renderers/index.js';

export default NostrEventElement;
