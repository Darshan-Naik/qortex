# 🗄️ qortex-store

> **Framework-agnostic lightweight state management 🧠**

[![npm version](https://badge.fury.io/js/qortex-store.svg)](https://badge.fury.io/js/qortex-store)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🪶 **Tiny** — zero runtime dependencies
- 🔐 **Type-safe** — full TypeScript generics
- ⚡ **Fast** — listeners only fire on reference changes (`Object.is`)
- 🧩 **Framework-agnostic** — works anywhere (pair with `qortex-store-react` for React)

```bash
npm install qortex-store
```

## 🚀 Quick Start

```ts
import { createStore } from "qortex-store";

const counterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Read state
counterStore.get().count; // 0

// Update state
counterStore.get().increment();
counterStore.get().count; // 1

// Subscribe to changes
const unsub = counterStore.subscribe((state, prev) => {
  console.log("count:", prev.count, "→", state.count);
});

// Clean up
unsub();
counterStore.destroy();
```

## 🔋 Persistence

**qortex-store** supports automatic hydration and persistence. While you can implement your own `StorePersister`, the recommended way is using **[qortex-db/store](../db)**:

```ts
import { createDB } from "qortex-db";
import { createStorePersister } from "qortex-db/store";
import { createStore } from "qortex-store";

const db = createDB("myapp");

const store = createStore(
  (set) => ({ theme: "light" }),
  { persister: createStorePersister(db) }
);
// ↑ Automatically hydrates on creation and persists on change.
```

## 📖 Documentation

**Complete documentation, examples, and API reference available at:**

### 🌐 [qortex.darshannaik.com](https://qortex.darshannaik.com)

## 📖 API

### `createStore(initializer)`

Create a new store. The `initializer` receives `set` and `get`:

| Param         | Type                        | Description                        |
|---------------|-----------------------------|------------------------------------|
| `initializer` | `(set, get) => InitialState`| Returns the initial state object   |

### `Store<T>`

| Method      | Signature                                   | Description                           |
|-------------|---------------------------------------------|---------------------------------------|
| `get`       | `() => T`                                   | Current state snapshot                |
| `set`       | `(partial \| updater, replace?) => void`     | Merge (default) or replace state      |
| `subscribe` | `(listener) => unsubscribe`                  | Listen for changes                    |
| `destroy`   | `() => void`                                | Clear listeners, reset to initial     |

## 📄 License

LGPL-3.0 — see [LICENSE](../../LICENSE).

## 🎯 Support

Need help? Have questions? Want to chat about state management strategies?

- 📚 **Documentation**: [qortex.darshannaik.com](https://qortex.darshannaik.com)
- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Darshan-Naik/qortex/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Darshan-Naik/qortex/discussions)
- 🌟 **Repository**: [https://github.com/Darshan-Naik/qortex](https://github.com/Darshan-Naik/qortex)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
