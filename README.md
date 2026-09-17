# nostr-event-dom

[![npm version](https://img.shields.io/npm/v/nostr-event-dom.svg)](https://www.npmjs.com/package/nostr-event-dom)
[![license](https://img.shields.io/npm/l/nostr-event-dom.svg)](https://github.com/Nostr-org-tr/nostr-event-dom/blob/main/LICENSE)

A lightweight, zero-config Web Component (`<nostr-event>`) to embed and render Nostr events across any website or application.

Inspired by [`<mastodon-post>`](https://github.com/daviddarnes/mastodon-post), `<nostr-event>` provides progressive enhancement, automatic relay resolution, safe content sanitization, and full CSS customizability without requiring complex template markup.

---

## ✨ Features

- **Progressive Enhancement**: Drop a regular `<a>` link to a Nostr note/profile inside `<nostr-event>` and it automatically hydrates in JavaScript-enabled browsers while remaining indexable by search engines.
- **Multiple Event Kinds Supported**:
  - **Kind 0 (Profile)**: Avatar, banner, name, display name, NIP-05 badge, bio, website, Lightning address (lud16).
  - **Kind 1 (Text Note)**: Rich parsed notes with autolinked URLs, hashtags, NIP-21 `nostr:` mentions, and inline image/video embeds.
  - **Kind 30023 (Long-form Article / NIP-23)**: Rich markdown typography, cover images, summaries, and topic tags.
  - **Kind 31922 / 31923 (Calendar Event / NIP-52)**: Time/date-based events, location details, organizer metadata.
  - **Kind 20 / 21 / 22 (Media / NIP-68 / NIP-71)**: Native photo viewers, 16:9 responsive video players, and 9:16 vertical short videos.
  - **Generic Fallback**: Clean card rendering for any other kind with an expandable raw JSON viewer.
- **Relay Resolution & In-Memory Caching**: Fetches from default relays (`wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.nostr.band`, `wss://purplerelay.com`) or custom relays specified via `relays="..."`.
- **Security First**: Strict HTML sanitization to prevent XSS attacks; verifies safe protocols (`https:`, `nostr:`, `lightning:`) and escapes malicious attributes.
- **CSS Variable Theming & `::part()`**: Full design control via CSS custom properties and Shadow DOM `::part` selectors without needing custom HTML templates.

---

## 🚀 Quick Start

### 1. Include via CDN / Script Tag

```html
<!-- Standalone Script (Works offline & online) -->
<script src="https://unpkg.com/nostr-event-dom"></script>

<!-- Or ES Module -->
<!-- <script type="module" src="https://unpkg.com/nostr-event-dom/dist/nostr-event.js"></script> -->

<!-- Profile via NIP-05 -->
<nostr-event event="fiatjaf@fiatjaf.com"></nostr-event>

<!-- Profile via npub -->
<nostr-event event="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"></nostr-event>

<!-- Note via note1 or nevent1 -->
<nostr-event event="note1..."></nostr-event>

<!-- Long-form Article via naddr1 -->
<nostr-event event="naddr1..."></nostr-event>
```

### 2. Progressive Enhancement (Fallback Links)

```html
<script type="module" src="https://unpkg.com/nostr-event-dom"></script>

<nostr-event>
  <a href="nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6">
    View fiatjaf on Nostr
  </a>
</nostr-event>
```

### 3. Install via npm / yarn / pnpm

```bash
npm install nostr-event-dom
```

```javascript
import 'nostr-event-dom';
```

---

## ⚙️ Attribute Reference

| Attribute | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `src` | `string` | Nostr URI or bech32 identifier (`nevent1...`, `note1...`, `npub1...`, `nprofile1...`, `naddr1...`, or 64-char hex ID). | `null` |
| `relays` | `string` | Comma-separated list of WebSocket relay URLs. | Built-in defaults |
| `theme` | `light` \| `dark` \| `auto` | Color theme mode. | `auto` (system preference) |
| `hide-author` | `boolean` | Hides the author header block. | `false` |
| `hide-media` | `boolean` | Hides inline image/video embeds in notes. | `false` |
| `event` | `string` | Direct Nostr Event JSON string for offline or SSR hydration. | `null` |

---

## 🎨 Styling & CSS Customization

You can customize `<nostr-event>` using CSS Custom Properties or Shadow DOM `::part()` selectors without needing custom HTML templates:

### CSS Custom Properties

```css
nostr-event {
  --ne-card-bg: #18181b;
  --ne-border: #3f3f46;
  --ne-text: #f4f4f5;
  --ne-text-muted: #a1a1aa;
  --ne-accent: #f59e0b;
  --ne-accent-hover: #d97706;
  --ne-accent-light: #451a03;
  --ne-radius: 16px;
  --ne-font-sans: "Inter", sans-serif;
  --ne-font-mono: "Fira Code", monospace;
}
```

### Available `::part()` Selectors

- `::part(card)`: The outer event container card
- `::part(header)`: Author header section
- `::part(avatar)`: Author avatar image
- `::part(avatar-wrap)`: Avatar container
- `::part(name)`: Author display name
- `::part(nip05)`: NIP-05 verification badge
- `::part(body)`: Content body container
- `::part(media-embed)`: Embedded image/video container
- `::part(footer)`: Card footer
- `::part(protocol-link)`: "Open in Nostr" action link

Example:
```css
nostr-event::part(card) {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

nostr-event::part(name) {
  font-size: 1.1rem;
}
```

---

## 🛠️ Development & Building

```bash
# Install dependencies
make install

# Start local dev server with demo
make dev

# Run unit tests
make test

# Build production bundle
make build
```

---

## 📄 License
 
MIT © [nostr.org.tr community](https://github.com/Nostr-org-tr)
