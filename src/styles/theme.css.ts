export const COMPONENT_STYLES = `
:host {
  --nostr-bg: var(--ne-bg, #ffffff);
  --nostr-card-bg: var(--ne-card-bg, #ffffff);
  --nostr-text: var(--ne-text, #0f172a);
  --nostr-text-muted: var(--ne-text-muted, #64748b);
  --nostr-border: var(--ne-border, #e2e8f0);
  --nostr-accent: var(--ne-accent, #8b5cf6);
  --nostr-accent-hover: var(--ne-accent-hover, #7c3aed);
  --nostr-accent-light: var(--ne-accent-light, #f5f3ff);
  --nostr-code-bg: var(--ne-code-bg, #f1f5f9);
  --nostr-badge-bg: var(--ne-badge-bg, #f1f5f9);
  --nostr-radius: var(--ne-radius, 12px);
  --nostr-radius-sm: var(--ne-radius-sm, 6px);
  --nostr-font-sans: var(--ne-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
  --nostr-font-mono: var(--ne-font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  --nostr-shadow: var(--ne-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1));
  --nostr-avatar-size: var(--ne-avatar-size, 44px);
  --nostr-transition: 150ms ease-in-out;

  display: block;
  font-family: var(--nostr-font-sans);
  color: var(--nostr-text);
  line-height: 1.5;
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  :host(:not([theme="light"])) {
    --nostr-bg: var(--ne-bg, #0f172a);
    --nostr-card-bg: var(--ne-card-bg, #1e293b);
    --nostr-text: var(--ne-text, #f8fafc);
    --nostr-text-muted: var(--ne-text-muted, #94a3b8);
    --nostr-border: var(--ne-border, #334155);
    --nostr-accent: var(--ne-accent, #a78bfa);
    --nostr-accent-hover: var(--ne-accent-hover, #c4b5fd);
    --nostr-accent-light: var(--ne-accent-light, #2e1065);
    --nostr-code-bg: var(--ne-code-bg, #0f172a);
    --nostr-badge-bg: var(--ne-badge-bg, #334155);
    --nostr-shadow: var(--ne-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.3));
  }
}

:host([theme="dark"]) {
  --nostr-bg: var(--ne-bg, #0f172a);
  --nostr-card-bg: var(--ne-card-bg, #1e293b);
  --nostr-text: var(--ne-text, #f8fafc);
  --nostr-text-muted: var(--ne-text-muted, #94a3b8);
  --nostr-border: var(--ne-border, #334155);
  --nostr-accent: var(--ne-accent, #a78bfa);
  --nostr-accent-hover: var(--ne-accent-hover, #c4b5fd);
  --nostr-accent-light: var(--ne-accent-light, #2e1065);
  --nostr-code-bg: var(--ne-code-bg, #0f172a);
  --nostr-badge-bg: var(--ne-badge-bg, #334155);
  --nostr-shadow: var(--ne-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.3));
}

:host *, :host *::before, :host *::after {
  box-sizing: border-box;
}

.nostr-card {
  background-color: var(--nostr-card-bg);
  border: 1px solid var(--nostr-border);
  border-radius: var(--nostr-radius);
  box-shadow: var(--nostr-shadow);
  overflow: hidden;
  position: relative;
  transition: border-color var(--nostr-transition);
}

/* Header & Author Info */
.nostr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
}

.nostr-avatar-wrap {
  flex-shrink: 0;
  width: var(--nostr-avatar-size);
  height: var(--nostr-avatar-size);
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--nostr-border);
}

.nostr-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.nostr-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--nostr-accent), #ec4899);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
}

.nostr-author-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nostr-author-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.nostr-name {
  font-weight: 700;
  color: var(--nostr-text);
  text-decoration: none;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nostr-name:hover {
  text-decoration: underline;
}

.nostr-nip05 {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--nostr-accent);
  background-color: var(--nostr-accent-light);
  padding: 1px 6px;
  border-radius: var(--nostr-radius-sm);
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nostr-nip05-badge {
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
}

.nostr-handle {
  font-size: 13px;
  color: var(--nostr-text-muted);
}

.nostr-time {
  font-size: 12px;
  color: var(--nostr-text-muted);
  text-decoration: none;
}

.nostr-time:hover {
  text-decoration: underline;
}

/* Content Area */
.nostr-body {
  padding: 0 16px 16px;
  font-size: 15px;
  color: var(--nostr-text);
  word-break: break-word;
  white-space: pre-wrap;
}

.nostr-body a,
.nostr-link {
  color: var(--nostr-accent);
  text-decoration: none;
  font-weight: 500;
}

.nostr-body a:hover,
.nostr-link:hover {
  text-decoration: underline;
  color: var(--nostr-accent-hover);
}

.nostr-mention {
  color: var(--nostr-accent);
  background-color: var(--nostr-accent-light);
  padding: 1px 5px;
  border-radius: var(--nostr-radius-sm);
  text-decoration: none;
  font-weight: 500;
}

.nostr-hashtag {
  color: var(--nostr-accent);
  text-decoration: none;
  font-weight: 500;
}

.nostr-inline-code {
  font-family: var(--nostr-font-mono);
  font-size: 0.9em;
  background-color: var(--nostr-code-bg);
  padding: 2px 6px;
  border-radius: var(--nostr-radius-sm);
  border: 1px solid var(--nostr-border);
}

.nostr-code-block,
.nostr-article-code {
  font-family: var(--nostr-font-mono);
  font-size: 13px;
  background-color: var(--nostr-code-bg);
  border: 1px solid var(--nostr-border);
  border-radius: var(--nostr-radius-sm);
  padding: 12px;
  overflow-x: auto;
  margin: 10px 0;
  white-space: pre;
}

/* Media Gallery & Embeds */
.nostr-media-embed {
  margin-top: 10px;
  border-radius: var(--nostr-radius-sm);
  overflow: hidden;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nostr-media-image {
  max-width: 100%;
  max-height: 520px;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: var(--nostr-radius-sm);
}

.nostr-media-video {
  width: 100%;
  max-height: 540px;
  border-radius: var(--nostr-radius-sm);
}

.nostr-media-audio {
  width: 100%;
  margin: 8px 0;
}

/* Profile Specific (Kind 0) */
.nostr-profile-card {
  position: relative;
}

.nostr-profile-banner {
  height: 140px;
  width: 100%;
  background-color: var(--nostr-border);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.nostr-profile-content {
  padding: 0 20px 20px;
  margin-top: -45px;
}

.nostr-profile-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: 4px solid var(--nostr-card-bg);
  overflow: hidden;
  background-color: var(--nostr-border);
  box-shadow: var(--nostr-shadow);
}

.nostr-profile-name-row {
  margin-top: 10px;
}

.nostr-profile-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--nostr-text);
  margin: 0;
}

.nostr-profile-nip05 {
  margin-top: 4px;
  display: inline-block;
}

.nostr-profile-about {
  margin-top: 12px;
  font-size: 14px;
  color: var(--nostr-text);
  line-height: 1.6;
}

.nostr-profile-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--nostr-border);
  font-size: 13px;
  color: var(--nostr-text-muted);
}

.nostr-profile-extra-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Article Specific (Kind 30023 / NIP-23) */
.nostr-article-card {
  padding: 0;
}

.nostr-article-cover {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

.nostr-article-header {
  padding: 20px 24px 12px;
}

.nostr-article-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  margin: 0 0 8px 0;
  color: var(--nostr-text);
}

.nostr-article-summary {
  font-size: 16px;
  color: var(--nostr-text-muted);
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.nostr-article-body {
  padding: 0 24px 24px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--nostr-text);
}

.nostr-article-body h1,
.nostr-article-body h2,
.nostr-article-body h3 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 700;
}

.nostr-article-body blockquote {
  border-left: 4px solid var(--nostr-accent);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--nostr-text-muted);
  font-style: italic;
}

.nostr-article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 24px 20px;
}

/* Calendar Event (Kind 31922 / 31923 / NIP-52) */
.nostr-event-calendar {
  padding: 20px;
}

.nostr-cal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--nostr-accent-light);
  color: var(--nostr-accent);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--nostr-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.nostr-cal-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--nostr-text);
}

.nostr-cal-details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  font-size: 14px;
  margin: 16px 0;
  background-color: var(--nostr-code-bg);
  padding: 14px;
  border-radius: var(--nostr-radius-sm);
}

.nostr-cal-label {
  font-weight: 600;
  color: var(--nostr-text-muted);
}

.nostr-cal-value {
  color: var(--nostr-text);
}

/* Video / Short / Photo Media (Kind 20, 21, 22) */
.nostr-media-card {
  padding: 0;
}

.nostr-media-player-wrap {
  background-color: #000000;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nostr-short-player {
  max-width: 380px;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
  width: 100%;
}

.nostr-short-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nostr-video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.nostr-photo-viewer {
  width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.nostr-media-meta {
  padding: 16px;
}

.nostr-media-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 6px;
  color: var(--nostr-text);
}

/* Generic Fallback Card */
.nostr-fallback-card {
  padding: 16px;
}

.nostr-kind-badge {
  display: inline-block;
  font-size: 12px;
  font-family: var(--nostr-font-mono);
  background-color: var(--nostr-badge-bg);
  color: var(--nostr-text-muted);
  padding: 2px 8px;
  border-radius: var(--nostr-radius-sm);
  margin-bottom: 10px;
}

.nostr-raw-json {
  margin-top: 12px;
  font-family: var(--nostr-font-mono);
  font-size: 12px;
  background-color: var(--nostr-code-bg);
  padding: 10px;
  border-radius: var(--nostr-radius-sm);
  max-height: 250px;
  overflow: auto;
}

/* Footer & Actions */
.nostr-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--nostr-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--nostr-text-muted);
}

.nostr-protocol-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--nostr-accent);
  text-decoration: none;
  font-weight: 600;
}

.nostr-protocol-link:hover {
  text-decoration: underline;
}

/* Loading & Error States */
.nostr-loading,
.nostr-error {
  padding: 24px;
  text-align: center;
  border: 1px dashed var(--nostr-border);
  border-radius: var(--nostr-radius);
  color: var(--nostr-text-muted);
  font-size: 14px;
}

.nostr-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--nostr-border);
  border-top-color: var(--nostr-accent);
  border-radius: 50%;
  animation: nostr-spin 0.8s linear infinite;
  margin-bottom: 8px;
}

@keyframes nostr-spin {
  to { transform: rotate(360deg); }
}
`;
