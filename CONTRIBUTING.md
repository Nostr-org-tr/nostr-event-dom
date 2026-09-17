# Contributing to nostr-event-dom

Thank you for your interest in contributing to `nostr-event-dom`! We welcome contributions from everyone in the Nostr and open-source communities.

---

## 🛠️ Development Setup

### Prerequisites

- Node.js (version 20+ or 22+ recommended)
- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)
- `make`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nostr-org-tr/nostr-event-dom.git
   cd nostr-event-dom
   ```

2. Load the designated Node version and install dependencies:
   ```bash
   make install
   ```

3. Start the development server and playground:
   ```bash
   make dev
   ```

---

## 🧪 Testing & Verification

Before submitting changes, please ensure that all tests pass and there are no TypeScript or build issues:

```bash
# Run unit test suite
make test

# Run tests in watch mode during development
make test-watch

# Run TypeScript type check
make lint

# Run production build
make build
```

---

## 📋 Pull Request Process

1. **Create a branch**: Use descriptive branch names like `feat/nip-XX-support`, `fix/avatar-fallback`, or `docs/update-readme`.
2. **Write clean, typed code**: Keep code modular, strictly typed, and free of unnecessary dependencies.
3. **Add tests**: Any new feature, parser, or renderer should have corresponding unit tests in the `tests/` directory.
4. **Security & Sanitization**: Ensure that any user-supplied content or event data is sanitized against XSS attacks using `src/utils/sanitize.ts`.
5. **Open a PR**: Submit your pull request to the `main` branch with a clear description of the changes and any relevant issue references.

---

## 📜 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.
