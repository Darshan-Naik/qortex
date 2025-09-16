# 🎯 dquery-core

> **Framework-agnostic query cache. Set and read data from anywhere! 🧠**

[![npm version](https://badge.fury.io/js/dquery-core.svg)](https://badge.fury.io/js/dquery-core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dquery-core)](https://bundlephobia.com/package/dquery-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ What makes this special?

**d-query-core** lets you **set and read data from anywhere** - not just within a specific framework! Perfect for:

- 🔐 **App core data** - Authentication, user profiles accessible from anywhere
- 🎯 **Cross-framework** - Share data between React, Vue, vanilla JS, Node.js
- 🔄 **Background services** - WebSocket updates, timers, external events
- ⚡ **Real-time apps** - Push changes from anywhere, see them everywhere instantly

```bash
pnpm add dquery-core
```

```ts
import { queryManager } from "dquery-core";

// Register a fetcher
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    return response.json();
  },
  staleTime: 10_000, // 10 seconds
  placeholderData: []
});

// Fetch data
const todos = await queryManager.fetchQuery(["todos"]);
console.log("Todos loaded:", todos);
```

## 🔐 Perfect for Authentication

```ts
// Auth service - update from anywhere
class AuthService {
  async login(email: string, password: string) {
    const { user, token } = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
    
    // 🎯 Update auth state - accessible everywhere!
    queryManager.setQueryData(["auth", "user"], user);
    queryManager.setQueryData(["auth", "isAuthenticated"], true);
  }
  
  logout() {
    // 🎯 Clear auth state from anywhere
    queryManager.setQueryData(["auth", "user"], null);
    queryManager.setQueryData(["auth", "isAuthenticated"], false);
  }
}

// Access from any environment
// React
function useAuth() {
  const user = queryManager.getQueryData(["auth", "user"]);
  const isAuthenticated = queryManager.getQueryData(["auth", "isAuthenticated"]);
  return { user, isAuthenticated };
}

// React with hooks (dquery-react package)
import { useQuery, useQueryData } from "dquery-react";

function AuthComponent() {
  const { data: user, isLoading } = useQuery(["auth", "user"]);
  const isAuthenticated = useQueryData(["auth", "isAuthenticated"]);
  
  if (isLoading) return <div>Loading...</div>;
  return <div>Welcome {user?.name}</div>;
}

// Vue
function useAuth() {
  const user = ref(queryManager.getQueryData(["auth", "user"]));
  const isAuthenticated = ref(queryManager.getQueryData(["auth", "isAuthenticated"]));
  
  queryManager.subscribeQuery(["auth", "user"], (state) => {
    user.value = state.data;
  });
  
  return { user, isAuthenticated };
}

// Vanilla JS
function checkAuth() {
  const user = queryManager.getQueryData(["auth", "user"]);
  const isAuthenticated = queryManager.getQueryData(["auth", "isAuthenticated"]);
  return { user, isAuthenticated };
}
```

## 🎨 API Reference

### `queryManager.registerFetcher(key, options)`

```ts
queryManager.registerFetcher(key, {
  fetcher: async () => Promise<T>,
  staleTime?: number, // Default: 0
  placeholderData?: T,
  enabled?: boolean // Default: true
});
```

### `queryManager.fetchQuery(key, options?)`

```ts
const data = await queryManager.fetchQuery(key, {
  fetcher?: Fetcher<T>,
  staleTime?: number
});
```

### `queryManager.setQueryData(key, data)`

```ts
// Direct update
queryManager.setQueryData(["todos"], newTodos);

// Functional update
queryManager.setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);
```

### `queryManager.getQueryData(key)`

```ts
const user = queryManager.getQueryData(["auth", "user"]);
const isAuthenticated = queryManager.getQueryData(["auth", "isAuthenticated"]);
```

### React Hooks (dquery-react package)

```tsx
import { useQuery, useQueryData } from "dquery-react";

// Full query state with loading, error, refetch
const { data, isLoading, error, refetch } = useQuery(["todos"]);

// Just the data - simpler API
const todos = useQueryData(["todos"]);
```

### `queryManager.subscribeQuery(key, callback)`

```ts
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("State changed:", state);
});
```

## 🎯 More Examples

### WebSocket Updates

```ts
// Update data from WebSocket
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  queryManager.setQueryData(["live-stats"], data);
};

// Access from any environment
const stats = queryManager.getQueryData(["live-stats"]);
console.log("Users online:", stats?.users);
```

### Cross-Framework Data Sharing

```ts
// React component updates data
function ReactComponent() {
  const updateTheme = () => {
    queryManager.setQueryData(["user", "preferences"], { theme: "dark" });
  };
  return <button onClick={updateTheme}>Update Theme</button>;
}

// Vue component automatically reflects changes
function VueComponent() {
  const preferences = ref(queryManager.getQueryData(["user", "preferences"]));
  
  queryManager.subscribeQuery(["user", "preferences"], (state) => {
    preferences.value = state.data;
  });
  
  return { preferences };
}

// Vanilla JS also gets updates
function vanillaJSFunction() {
  const preferences = queryManager.getQueryData(["user", "preferences"]);
  console.log("Current theme:", preferences?.theme);
}
```

## 🎭 TypeScript Support

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

// Type-safe usage
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: async (): Promise<User[]> => {
    const response = await fetch("/api/users");
    return response.json();
  }
});

const users = await queryManager.fetchQuery<User[]>(["users"]);
// users is typed as User[] | undefined
```

## 📄 License

MIT License - feel free to use this in your projects! 🎉

## 🎯 Support

Need help? Have questions?

- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Darshan-Naik/d-query/issues)
- 🌟 **Repository**: [https://github.com/Darshan-Naik/d-query](https://github.com/Darshan-Naik/d-query)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
