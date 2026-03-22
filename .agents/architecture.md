# Qortex Repository Architecture

This document provides a comprehensive overview of the Qortex monorepo architecture. It serves as the source of truth for AI agents and developers.

## 📦 Package Ecosystem

Qortex is a modular ecosystem for state management and data fetching. It is split into core logic packages and framework-specific (React) adapters.

### 1. `qortex-query` (Core)
The engine for data fetching and caching.
- **`QueryManagerCore`**: A singleton (usually) that manages a `Map` of query states. It handles:
  - **Caching**: Deduplicates requests based on `QueryKey`.
  - **Throttling**: Prevents rapid refetching.
  - **Invalidation**: Tracks stale data.
  - **Persistence Interface**: Defines the `Persister` interface but does not implement storage.

### 2. `qortex-query-react` (React)
The bridge between `qortex-query` and React.
- **Hooks**: `useQuery`, `useMutate`, `useQueryData`, `useQuerySelect`.
- **Context**: Provides the `QueryManagerCore` instance to the component tree.

### 3. `qortex-store` (Core)
A minimalistic, framework-agnostic state management library.
- **`createStore`**: Creates a store with `get`, `set`, and `subscribe`.
- **Features**: Supports partial updates, functional updates, and optional persistence integration via the `StorePersister` interface.

### 4. `qortex-store-react` (React)
The React bridge for `qortex-store`.
- **`useStore`**: A hook that subscribes to store changes and triggers re-renders using `useSyncExternalStore`.

### 5. `qortex-db` (Unified Storage & Adapters)
The centralized persistence layer for the entire ecosystem.
- **`createDB`**: Provides a unified API for `localStorage`, `sessionStorage`, and `IndexedDB`.
- **Subpath Exports**: To maintain tiny bundle sizes, persistence adapters are isolated in subpaths:
  - `qortex-db/query`: Adapts `qortex-db` to the `qortex-query` Persister interface.
  - `qortex-db/store`: Adapts `qortex-db` to the `qortex-store` StorePersister interface.

---

## 🏎️ Critical Architectural Patterns

### Async Hydration Barrier
Because browser storage (especially IndexedDB) is asynchronous, Qortex implements a "Hydration Barrier" in its adapters:
- Every adapter (`createQueryPersister`, `createStorePersister`) maintains a internal `hydrationPromise`.
- **Initialization**: `hydrate()` is called as soon as the store/query-manager starts.
- **Blocking**: Any subsequent `persist()` or `sync()` calls **MUST** await this promise. This prevents the "Initial Write Race Condition" where a default memory state could overwrite fresh data from storage.

### Tree-Shaking & Isolation
- Core packages (`query`, `store`) **must never** depend on `qortex-db`. They only define interfaces.
- Users import adapters from subpaths (e.g., `qortex-db/query`) to avoid bundling unused storage drivers in the main application.

---

## 🛠️ Global Standards
- **VersionSync**: All packages should have synchronized versions (currently v2.0.0).
- **Major Bumps**: Breaking changes in interfaces or movements of logic between packages require a major version bump.
- **Documentation**: All public APIs must be documented in `doc-site/src/data/*.json`.
