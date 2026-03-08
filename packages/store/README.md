# 🗄️ @qortex/store

> **Framework-agnostic lightweight state management 🧠**

[![npm version](https://badge.fury.io/js/@qortex/store.svg)](https://badge.fury.io/js/@qortex/store)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🪶 **Tiny** — zero runtime dependencies
- 🔐 **Type-safe** — full TypeScript generics
- ⚡ **Fast** — listeners only fire on reference changes (`Object.is`)
- 🧩 **Framework-agnostic** — works anywhere (pair with `@qortex/store-react` for React)

```bash
npm install @qortex/store
```

## 🚀 Quick Start

```ts
import { createStore } from "@qortex/store";

const counterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Read state
counterStore.getState().count; // 0

// Update state
counterStore.getState().increment();
counterStore.getState().count; // 1

// Subscribe to changes
const unsub = counterStore.subscribe((state, prev) => {
  console.log("count:", prev.count, "→", state.count);
});

// Clean up
unsub();
counterStore.destroy();
```

## 📖 API

### `createStore(initializer)`

Create a new store. The `initializer` receives `set` and `get`:

| Param         | Type                        | Description                        |
|---------------|-----------------------------|------------------------------------|
| `initializer` | `(set, get) => InitialState`| Returns the initial state object   |

### `Store<T>`

| Method      | Signature                                   | Description                           |
|-------------|---------------------------------------------|---------------------------------------|
| `getState`  | `() => T`                                   | Current state snapshot                |
| `setState`  | `(partial \| updater, replace?) => void`     | Merge (default) or replace state      |
| `subscribe` | `(listener) => unsubscribe`                  | Listen for changes                    |
| `destroy`   | `() => void`                                | Clear listeners, reset to initial     |

## 📄 License

LGPL-3.0 — see [LICENSE](../../LICENSE).

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
