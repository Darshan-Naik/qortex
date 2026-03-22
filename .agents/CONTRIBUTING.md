# Qortex AI Agent Contribution Guidelines

This document provides standards for AI agents contributing to the Qortex repository.

## 📏 Standards & Best Practices

1.  **Architecture Alignment**: Before making any structural changes, read `.agents/architecture.md`. All changes must follow the "Interface vs. Implementation" decoupling (Core vs. `qortex-db`).
2.  **Update Documentation**: 
    *   **Architecture Ref**: Any change to package structure, inter-package calls, or core logic **MUST** be documented in `.agents/architecture.md`.
    *   **Public API**: All public API changes must be reflected in `doc-site/src/data/*.json`.
3.  **Major Bumps**: Any change that modifies interfaces or shifts logic between packages **MUST** trigger a major version bump (e.g., v2 → v3).
4.  **Async Safety**: Always account for asynchronous storage (IndexedDB). Maintain the `hydrationPromise` guards in all persistence adapters to prevent data loss.
5.  **Subpath Exports**: Maintain the `qortex-db/<subpath>` pattern for all new adapters to ensure modularity and tree-shaking.
6.  **Testing**:
    *   New persistence logic `must` have integration tests in `packages/db/src/__tests__`.
    *   Core logic changes `must` pass package-level tests.
    *   Use `pnpm exec jest <path>` for all testing commands.
7.  **Package Versioning**: Keep the root `package.json` and all `packages/*/package.json` versions in sync (currently v2.0.0).

---

## 🏗️ Refactor Log (v2.0.0)
- Decoupled `createPersister` from `qortex-query` and moved it into `qortex-db/query`.
- Added `StorePersister` to `qortex-store` via `qortex-db/store`.
- All persistence adapters were made async-safe against hydration race conditions.
