# 🎯 d-query (Core Runtime)

> **Framework-agnostic query cache & fetch registry. The brain behind d-query! 🧠**

[![npm version](https://badge.fury.io/js/d-query.svg)](https://badge.fury.io/js/d-query)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/d-query)](https://bundlephobia.com/package/d-query)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ What is d-query Core?

The **d-query** core runtime is a lightweight, framework-agnostic query management system that provides:

- 🎪 **Smart caching** with configurable stale time and cache time
- 🔄 **Automatic deduplication** - multiple requests for the same data are merged
- 🎯 **Background refetching** with intelligent invalidation
- 💾 **Previous data preservation** during refetches
- ⚡ **Shallow equality** to prevent unnecessary updates
- 🛑 **AbortController** support for request cancellation
- 🎭 **TypeScript** support with full type safety

## 🚀 Installation

```bash
pnpm add d-query
# or
npm install d-query
# or
yarn add d-query
```

## 🎯 Quick Start

```ts
import { queryManager } from "d-query";

// Register a fetcher (triggers immediate prefetch by default)
queryManager.registerFetcher(["todos"], {
  fetcher: async ({ signal }) => {
    const response = await fetch("/api/todos", { signal });
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },
  staleTime: 10_000, // 10 seconds of freshness
  cacheTime: 5 * 60 * 1000, // 5 minutes in cache
  placeholderData: [] // Show empty array while loading
});

// Fetch data manually
const todos = await queryManager.fetchQuery(["todos"]);
console.log("🎉 Todos loaded:", todos);
```

## 🎪 Core Features

### 🎯 Automatic Caching

```ts
// Data is automatically cached and shared across your app
queryManager.registerFetcher(["user", userId], {
  fetcher: async ({ signal }) => {
    const response = await fetch(`/api/users/${userId}`, { signal });
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  cacheTime: 30 * 60 * 1000 // Cached for 30 minutes
});

// Multiple calls to the same user will use cached data
const user1 = await queryManager.fetchQuery(["user", "123"]);
const user2 = await queryManager.fetchQuery(["user", "123"]); // Uses cache!
```

### 🔄 Background Refetching

```ts
// Data is automatically refetched in the background when stale
queryManager.registerFetcher(["live-data"], {
  fetcher: fetchLiveData,
  staleTime: 30_000 // Considered stale after 30 seconds
});

// First call fetches data
const data1 = await queryManager.fetchQuery(["live-data"]);

// Wait 35 seconds...
setTimeout(async () => {
  // This will return cached data immediately, but trigger background refetch
  const data2 = await queryManager.fetchQuery(["live-data"]);
  console.log("Immediate response:", data2); // Cached data
  // Fresh data will be available on next call
}, 35000);
```

### 💾 Previous Data Preservation

```ts
// Previous data is always preserved during refetches
queryManager.registerFetcher(["posts"], {
  fetcher: fetchPosts,
  staleTime: 0 // Always stale
});

const posts1 = await queryManager.fetchQuery(["posts"]);
console.log("Initial posts:", posts1);

// Refetch in background
const posts2 = await queryManager.fetchQuery(["posts"]);
console.log("Still showing old posts:", posts2); // Same as posts1

// Fresh data available after fetch completes
setTimeout(() => {
  const posts3 = queryManager.getQueryData(["posts"]);
  console.log("Fresh posts:", posts3); // New data
}, 1000);
```

## 🎨 API Reference

### `queryManager.registerFetcher(key, options)`

Register a fetcher function for a query key.

```ts
queryManager.registerFetcher(key, {
  fetcher: async ({ signal }) => Promise<T>,
  staleTime?: number, // Default: 0
  cacheTime?: number, // Default: 5 minutes
  placeholderData?: T, // Default: undefined
  enabled?: boolean, // Default: true
  equalityFn?: (a: T, b: T) => boolean, // Default: shallow equality
  usePreviousDataOnError?: boolean, // Default: false
  usePlaceholderOnError?: boolean // Default: false
});
```

**Example:**
```ts
queryManager.registerFetcher(["products"], {
  fetcher: async ({ signal }) => {
    const response = await fetch("/api/products", { signal });
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: [],
  enabled: true
});
```

### `queryManager.fetchQuery(key, options?)`

Manually fetch data for a query.

```ts
const data = await queryManager.fetchQuery(key, {
  signal?: AbortSignal,
  equalityFn?: (a: T, b: T) => boolean,
  fetcher?: Fetcher<T>,
  staleTime?: number,
  cacheTime?: number
});
```

**Example:**
```ts
try {
  const products = await queryManager.fetchQuery(["products"], {
    signal: AbortSignal.timeout(5000) // 5 second timeout
  });
  console.log("Products loaded:", products);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log("Request was cancelled");
  } else {
    console.error("Failed to fetch products:", error);
  }
}
```

### `queryManager.setQueryData(key, { data })`

Update query cache directly.

```ts
// Direct update
queryManager.setQueryData(["todos"], { data: newTodos });

// Functional update
queryManager.setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);
```

**Example:**
```ts
// Optimistic update
queryManager.setQueryData(["todos"], (oldTodos) => [
  ...(oldTodos || []),
  { id: Date.now(), title: "New todo", completed: false }
]);

// Later, sync with server
try {
  const savedTodo = await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title: "New todo" })
  }).then(r => r.json());

  // Update with real data
  queryManager.setQueryData(["todos"], (oldTodos) =>
    oldTodos?.map(todo => 
      todo.id === Date.now() ? savedTodo : todo
    )
  );
} catch (error) {
  // Rollback on error
  queryManager.setQueryData(["todos"], (oldTodos) =>
    oldTodos?.filter(todo => todo.id !== Date.now())
  );
}
```

### `queryManager.getQueryData(key)`

Get cached data for a query.

```ts
const cachedData = queryManager.getQueryData(["todos"]);
```

**Example:**
```ts
// Check if data exists before making a request
const cachedTodos = queryManager.getQueryData(["todos"]);
if (cachedTodos) {
  console.log("Using cached todos:", cachedTodos);
} else {
  console.log("No cached data, will fetch from server");
}
```

### `queryManager.getQueryState(key)`

Get current query state.

```ts
const state = queryManager.getQueryState(["todos"]);
// Returns: { 
//   data, error, status, updatedAt, isStale, 
//   isPlaceholderData, isLoading, isFetching, 
//   isError, isSuccess 
// }
```

**Example:**
```ts
const state = queryManager.getQueryState(["user", userId]);
console.log("Query state:", {
  hasData: !!state.data,
  isLoading: state.isLoading,
  isFetching: state.isFetching,
  isStale: state.isStale,
  lastUpdated: state.updatedAt ? new Date(state.updatedAt) : null,
  hasError: !!state.error
});
```

### `queryManager.invalidateQuery(key)`

Mark query as stale and trigger refetch.

```ts
queryManager.invalidateQuery(["todos"]);
```

**Example:**
```ts
// Invalidate after creating a new todo
async function createTodo(title: string) {
  const newTodo = await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  }).then(r => r.json());

  // Invalidate to refetch fresh data
  queryManager.invalidateQuery(["todos"]);
  
  return newTodo;
}
```

### `queryManager.cancelFetch(key)`

Cancel ongoing fetch request.

```ts
queryManager.cancelFetch(["todos"]);
```

**Example:**
```ts
// Cancel request when component unmounts
const controller = new AbortController();

queryManager.fetchQuery(["todos"], {
  signal: controller.signal
});

// Later, cancel the request
queryManager.cancelFetch(["todos"]);
// or
controller.abort();
```

### `queryManager.subscribeQuery(key, callback)`

Subscribe to query state changes.

```ts
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("State changed:", state);
});
```

**Example:**
```ts
// Subscribe to real-time updates
const unsubscribe = queryManager.subscribeQuery(["live-data"], (state) => {
  if (state.isFetching) {
    console.log("🔄 Fetching fresh data...");
  }
  
  if (state.data) {
    console.log("📊 New data received:", state.data);
  }
  
  if (state.error) {
    console.error("❌ Error occurred:", state.error);
  }
});

// Clean up subscription
unsubscribe();
```

## 🎪 Advanced Usage

### 🎯 Custom Equality Functions

```ts
import { isEqual } from "lodash";

queryManager.registerFetcher(["complex-data"], {
  fetcher: async () => fetch("/api/complex").then(r => r.json()),
  equalityFn: isEqual // Deep equality comparison
});

// Or create your own
queryManager.registerFetcher(["user-preferences"], {
  fetcher: fetchUserPreferences,
  equalityFn: (a, b) => {
    // Custom comparison logic
    return a?.theme === b?.theme && a?.language === b?.language;
  }
});
```

### 🎪 Error Handling

```ts
queryManager.registerFetcher(["risky-data"], {
  fetcher: async () => {
    const response = await fetch("/api/risky");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  placeholderData: { message: "Loading..." },
  usePlaceholderOnError: true, // Show placeholder on error
  usePreviousDataOnError: true // Keep previous data on error
});

// Handle errors when fetching
try {
  const data = await queryManager.fetchQuery(["risky-data"]);
  console.log("Success:", data);
} catch (error) {
  console.error("Failed to fetch:", error.message);
  
  // Get cached data as fallback
  const cachedData = queryManager.getQueryData(["risky-data"]);
  if (cachedData) {
    console.log("Using cached data:", cachedData);
  }
}
```

### 🎯 Conditional Fetching

```ts
// Only register fetcher when conditions are met
function setupUserFetcher(userId: string | null) {
  if (!userId) return;
  
  queryManager.registerFetcher(["user", userId], {
    fetcher: async ({ signal }) => {
      const response = await fetch(`/api/users/${userId}`, { signal });
      return response.json();
    },
    enabled: !!userId // Only fetch when userId exists
  });
}

// Usage
setupUserFetcher("123"); // Will fetch
setupUserFetcher(null); // Won't fetch
```

### 🎪 Request Deduplication

```ts
// Multiple simultaneous requests for the same data are automatically deduplicated
const promises = [
  queryManager.fetchQuery(["todos"]),
  queryManager.fetchQuery(["todos"]),
  queryManager.fetchQuery(["todos"])
];

// All three will resolve to the same data
const [todos1, todos2, todos3] = await Promise.all(promises);
console.log(todos1 === todos2 && todos2 === todos3); // true
```

### 🎯 Cache Management

```ts
// Clear specific cache entry
queryManager.setQueryData(["todos"], { data: undefined });

// Or remove it entirely
queryManager.invalidateQuery(["todos"]);

// Check cache size (internal)
const cacheSize = queryManager.cache.size;
console.log(`Cache contains ${cacheSize} entries`);
```

## 🎭 Framework Integration

### React Integration

```tsx
// Use with d-query-react
import { useQuery } from "d-query-react";

function TodosList() {
  const { data, isLoading, error } = useQuery(["todos"]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Vue Integration

```ts
// Use with Vue's reactivity system
import { ref, watchEffect } from 'vue';

export function useQuery(key) {
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  watchEffect(() => {
    isLoading.value = true;
    queryManager.fetchQuery(key)
      .then(result => {
        data.value = result;
        error.value = null;
      })
      .catch(err => {
        error.value = err;
      })
      .finally(() => {
        isLoading.value = false;
      });
  });

  return { data, isLoading, error };
}
```

### Vanilla JavaScript

```ts
// Use in vanilla JavaScript
class DataManager {
  constructor() {
    this.subscriptions = new Map();
  }

  async loadData(key) {
    try {
      const data = await queryManager.fetchQuery(key);
      this.notifySubscribers(key, { data, error: null });
      return data;
    } catch (error) {
      this.notifySubscribers(key, { data: null, error });
      throw error;
    }
  }

  subscribe(key, callback) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(key)?.delete(callback);
    };
  }

  notifySubscribers(key, state) {
    this.subscriptions.get(key)?.forEach(callback => callback(state));
  }
}
```

## 🎯 Performance Tips

### 1. 🎪 Optimize Cache Times

```ts
// Short-lived data (real-time updates)
queryManager.registerFetcher(["live-stats"], {
  fetcher: fetchLiveStats,
  staleTime: 0, // Always stale
  cacheTime: 30_000 // 30 seconds
});

// Long-lived data (user profiles)
queryManager.registerFetcher(["user-profile"], {
  fetcher: fetchUserProfile,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000 // 30 minutes
});
```

### 2. 🎯 Use Appropriate Equality Functions

```ts
// For simple data structures, shallow equality is perfect
queryManager.registerFetcher(["simple-data"], {
  fetcher: fetchSimpleData
  // equalityFn defaults to shallow equality
});

// For complex nested objects, use deep equality
queryManager.registerFetcher(["complex-data"], {
  fetcher: fetchComplexData,
  equalityFn: isEqual // From lodash
});
```

### 3. 🎪 Batch Related Requests

```ts
// These will be fetched in parallel
const [users, posts, comments] = await Promise.all([
  queryManager.fetchQuery(["users"]),
  queryManager.fetchQuery(["posts"]),
  queryManager.fetchQuery(["comments"])
]);
```

## 🎭 TypeScript Support

```ts
// Full type safety
interface User {
  id: string;
  name: string;
  email: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Type-safe fetcher
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: async (): Promise<User[]> => {
    const response = await fetch("/api/users");
    return response.json();
  }
});

// Type-safe data access
const users = await queryManager.fetchQuery<User[]>(["users"]);
// users is typed as User[] | undefined

const userState = queryManager.getQueryState<User[]>(["users"]);
// userState.data is typed as User[] | undefined
```


## 🎯 Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run type checking
pnpm run type-check

# Clean build artifacts
pnpm run clean
```

## 📄 License

MIT License - feel free to use this in your projects! 🎉

## 🎯 Support

Need help? Have questions? Want to chat about data fetching strategies?

- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
