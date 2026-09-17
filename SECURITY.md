# Security Policy

## Supported Versions

We actively support security updates for the following versions of `nostr-event-dom`:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Reporting a Vulnerability

The `nostr-event-dom` project handles untrusted Nostr event data and executes inside client web browsers. Security, especially protection against **Cross-Site Scripting (XSS)** and **malicious URI injection**, is our top priority.

If you discover a security vulnerability, please do NOT create a public GitHub issue.

Instead, please report it via one of the following channels:
- Email: **security@nostr.org.tr** or **info@nostr.org.tr**
- GitHub Security Advisories: Submit a private advisory via the repository's "Security" tab.

### What to Include in Your Report

- A description of the vulnerability and its potential impact.
- Clear steps to reproduce or a minimal proof-of-concept (PoC) event payload.
- Any suggested fixes or mitigations.

### Response Timeline

- **Acknowledgment**: Within 48 hours.
- **Assessment & Triage**: Within 5 business days.
- **Fix & Disclosure**: Coordinated release with a patch version bump on npm.
