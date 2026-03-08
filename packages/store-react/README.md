# ⚛️ @qortex/store-react

> **React bindings for @qortex/store ⚡**

[![npm version](https://badge.fury.io/js/@qortex/store-react.svg)](https://badge.fury.io/js/@qortex/store-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- ⚛️ **React 18+** — concurrent-mode safe with optimized subscriptions
- 🎯 **Selector support** — only re-render when your selected slice changes
- 🪶 **Tiny** — single hook, minimal overhead
- 🔐 **Type-safe** — full TypeScript generics

```bash
npm install @qortex/store-react
```

## 🚀 Quick Start

```tsx
import { createStore, useStore } from "@qortex/store-react";

// Create a store (do this outside components)
const counterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
}));

function Counter() {
  // Select only what you need
  const count = useStore(counterStore, (s) => s.count);
  const increment = useStore(counterStore, (s) => s.increment);

  return <button onClick={increment}>Count: {count}</button>;
}
```

## 📖 API

### `useStore(store, selector?, equalityFn?)`

| Param        | Type                         | Default      | Description                         |
|-------------|------------------------------|--------------|-------------------------------------|
| `store`      | `Store<T>`                  | *required*   | Store created with `createStore`    |
| `selector`   | `(state: T) => U`           | identity     | Pick a slice of state               |
| `equalityFn` | `(a: U, b: U) => boolean`   | `Object.is`  | Custom equality to skip re-renders  |

**Returns** the selected state `U`, kept in sync with the store.

## 📄 License

LGPL-3.0 — see [LICENSE](../../LICENSE).

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
