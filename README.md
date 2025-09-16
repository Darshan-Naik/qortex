# 🚀 d-query

> **A minimal, performant data fetching library with React integration. Built for simplicity, efficiency, and developer happiness! 🎉**

[![npm version](https://badge.fury.io/js/dquery-core.svg)](https://badge.fury.io/js/dquery-core)
[![npm version](https://badge.fury.io/js/dquery-react.svg)](https://badge.fury.io/js/dquery-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dquery-core)](https://bundlephobia.com/package/dquery-core)

## ✨ Why d-query?

Tired of complex data fetching libraries that make simple tasks complicated? **d-query** is here to save the day! 🦸‍♂️

- 🎯 **Dead simple** - Get started in 30 seconds
- ⚡ **Lightning fast** - Minimal bundle size, maximum performance
- 🧠 **Smart caching** - Automatic deduplication and background updates
- 🎭 **Framework agnostic** - Works with React, Vue, Svelte, or vanilla JS
- 🛡️ **TypeScript first** - Full type safety out of the box
- 🎪 **Fun to use** - Because coding should be enjoyable!

## 📦 Packages

| Package | Description | Size |
|---------|-------------|------|
| **`dquery-core`** | Core runtime with query management | ~3KB gzipped |
| **`dquery-react`** | React hooks and components | ~2KB gzipped |


## 📥 Installation

```bash
# Core runtime (works everywhere!)
npm install dquery-core

# React integration (if you're using React)
npm install dquery-react
```

## 🎯 Core Features

- **🎪 Automatic caching** with configurable stale time
- **🔄 Background refetching** with smart invalidation and throttling
- **💾 Previous data preservation** during refetches (no loading states for cached data!)
- **⚡ Shallow equality** to prevent unnecessary re-renders
- **🛑 Smart cleanup** and resource management
- **🎭 TypeScript** support with full type safety
- **🎨 Framework agnostic** - use anywhere!
- **⚡ Smart throttling** - 50ms window prevents duplicate fetches
- **🎯 Inflight protection** - prevents race conditions

## 🎪 Usage Examples

### 1. 🎯 Basic Setup (The Happy Path)

```ts
import { queryManager } from "dquery-core";

// Register a fetcher (triggers immediate prefetch by default)
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },
  staleTime: 10_000, // 10 seconds of freshness
  placeholderData: [], // Show empty array while loading
  // enabled: false // Skip immediate prefetch on register
});
```

### 2. 🎭 React Integration (The Magic)

```tsx
import { useQuery } from "dquery-react";

function TodosList() {
  const { data, isLoading, isFetching, error, refetch } = useQuery(["todos"], {
    refetchOnSubscribe: "stale" // Refetch if data is stale when component mounts
  });

  if (isLoading) return <div>🎯 Loading your todos...</div>;
  if (error) return <div>❌ Oops! {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "🔄 Refreshing..." : "🔄 Refresh"}
      </button>
      <ul>
        {data?.map(todo => (
          <li key={todo.id}>✅ {todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. 🎪 Manual Query Management (The Power User)

```ts
import { queryManager } from "dquery-core";

// Fetch data manually
const todos = await queryManager.fetchQuery(["todos"]);

// Update cache directly (optimistic updates!)
queryManager.setQueryData(["todos"], newTodos);

// Invalidate and refetch
queryManager.invalidateQuery(["todos"]);

// Subscribe to query state changes
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("🎭 Query state changed:", state);
});
```

## 🎨 Advanced Examples

### 🎯 Error Handling & Recovery

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, isLoading, refetch } = useQuery(["user", userId], {
    // Show placeholder data on error
    usePlaceholderOnError: true,
    placeholderData: { name: "Unknown User", avatar: "/default-avatar.png" },
    // Keep previous data on error
    usePreviousDataOnError: true,
    // Only fetch if userId exists
    enabled: !!userId
  });

  if (isLoading) return <div>🎯 Loading user...</div>;
  
  if (error) {
    return (
      <div>
        <p>❌ Failed to load user: {error.message}</p>
        <button onClick={() => refetch()}>🔄 Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
    </div>
  );
}
```

### 🎪 Optimistic Updates

```tsx
function AddTodo() {
  const addTodo = async (title: string) => {
    // Optimistically update the cache
    const tempId = Date.now();
    const newTodo = { id: tempId, title, completed: false };
    
    queryManager.setQueryData(["todos"], (oldData) => [
      ...(oldData || []),
      newTodo
    ]);

    try {
      // Make the actual request
      const savedTodo = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title })
      }).then(r => r.json());

      // Update with real data
      queryManager.setQueryData(["todos"], (oldData) =>
        oldData?.map(todo => 
          todo.id === tempId ? savedTodo : todo
        )
      );
    } catch (error) {
      // Rollback on error
      queryManager.setQueryData(["todos"], (oldData) =>
        oldData?.filter(todo => todo.id !== tempId)
      );
      throw error;
    }
  };

  return (
    <button onClick={() => addTodo("New todo")}>
      ➕ Add Todo
    </button>
  );
}
```

### 🎭 Custom Equality Functions

```ts
import { isEqual } from "lodash";

queryManager.registerFetcher(["complex-data"], {
  fetcher: async () => fetch("/api/complex").then(r => r.json()),
  equalityFn: isEqual // Deep equality comparison
});
```

### 🎯 Conditional Fetching

```tsx
function UserDashboard({ userId, includeProfile }: { 
  userId?: string; 
  includeProfile?: boolean 
}) {
  const { data: user } = useQuery(["user", userId], {
    enabled: !!userId // Only fetch when userId exists
  });

  const { data: profile } = useQuery(["user-profile", userId], {
    enabled: !!userId && includeProfile // Only fetch when both conditions are met
  });

  return (
    <div>
      {user && <h1>Welcome, {user.name}!</h1>}
      {profile && <p>Profile: {profile.bio}</p>}
    </div>
  );
}
```

### 🎪 Background Refetching

```tsx
function TodosList() {
  const { data, isFetching } = useQuery(["todos"], {
    refetchOnSubscribe: "stale" // Refetch if stale when component mounts
  });

  return (
    <div>
      {isFetching && <div>🔄 Updating in background...</div>}
      {/* Previous data remains visible during background fetch */}
      {data?.map(todo => <div key={todo.id}>✅ {todo.title}</div>)}
    </div>
  );
}
```

### 🎯 Global Configuration Setup

```tsx
// app.tsx - Set up global defaults for your entire app
import { queryManager } from "dquery-core";

// Configure global defaults for your app
queryManager.setDefaultConfig({
  staleTime: 2 * 60 * 1000, // 2 minutes default
  refetchOnSubscribe: "stale",
  throttleTime: 100, // 100ms throttle
  usePreviousDataOnError: true, // Keep previous data on errors
  usePlaceholderOnError: true // Show placeholders on errors
});

// Now all your queries will use these sensible defaults
function App() {
  return (
    <div>
      <UserProfile />
      <TodosList />
      <PostsList />
    </div>
  );
}

// Individual components can still override when needed
function LiveDataComponent() {
  const { data } = useQuery(["live-data"], {
    staleTime: 0, // Override: always fetch fresh data
    refetchOnSubscribe: "always" // Override: always refetch
  });
  
  return <div>{data}</div>;
}
```

## 🎨 API Reference

### Core Runtime (`dquery-core`)

#### `queryManager.registerFetcher(key, options)`

Register a fetcher function for a query key.

```ts
queryManager.registerFetcher(key, {
  fetcher: async () => Promise<T>,
  staleTime?: number, // Default: 0
  placeholderData?: T, // Default: undefined
  enabled?: boolean, // Default: true
  equalityFn?: (a: T, b: T) => boolean, // Default: shallow equality
  usePreviousDataOnError?: boolean, // Default: false
  usePlaceholderOnError?: boolean // Default: false
});
```

#### `queryManager.fetchQuery(key, options?)`

Manually fetch data for a query.

```ts
const data = await queryManager.fetchQuery(key, {
  equalityFn?: (a: T, b: T) => boolean,
  fetcher?: Fetcher<T>,
  staleTime?: number
});
```

#### `queryManager.setQueryData(key, data)`

Update query cache directly.

```ts
// Direct update
queryManager.setQueryData(["todos"], newTodos);

// Functional update
queryManager.setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);
```

#### `queryManager.getQueryData(key)`

Get cached data for a query.

```ts
const cachedData = queryManager.getQueryData(["todos"]);
```

#### `queryManager.getQueryState(key)`

Get current query state.

```ts
const state = queryManager.getQueryState(["todos"]);
// Returns: { 
//   data, error, status, updatedAt, isStale, 
//   isPlaceholderData, isLoading, isFetching, 
//   isError, isSuccess 
// }
```

#### `queryManager.invalidateQuery(key)`

Mark query as stale and trigger refetch.

```ts
queryManager.invalidateQuery(["todos"]);
```


#### `queryManager.subscribeQuery(key, callback)`

Subscribe to query state changes.

```ts
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("State changed:", state);
});
```

#### `queryManager.setDefaultConfig(config)`

Set global default configuration for all queries.

```ts
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnSubscribe: "stale",
  throttleTime: 100, // 100ms throttle
  usePreviousDataOnError: true,
  equalityFn: shallowEqual
});
```

**Configuration options:**
- `enabled?: boolean` - Whether queries are enabled by default
- `refetchOnSubscribe?: "stale" | "always" | false` - Default refetch behavior
- `staleTime?: number` - Default time before data is considered stale
- `usePreviousDataOnError?: boolean` - Keep previous data on error
- `usePlaceholderOnError?: boolean` - Use placeholder data on error
- `equalityFn?: EqualityFn<any>` - Default equality function
- `throttleTime?: number` - Default throttle time for duplicate request prevention

### React Integration (`dquery-react`)

#### `useQuery(key, options?)`

React hook for query data.

```tsx
const { 
  data, 
  isLoading, 
  isFetching, 
  error, 
  refetch,
  status,
  isStale,
  updatedAt,
  isPlaceholderData
} = useQuery(key, {
  refetchOnSubscribe?: "stale" | "always" | false, // Default: "stale"
  enabled?: boolean, // Default: true
  fetcher?: Fetcher<T>,
  staleTime?: number,
  equalityFn?: (a: T, b: T) => boolean,
  placeholderData?: T,
  usePreviousDataOnError?: boolean,
  usePlaceholderOnError?: boolean
});
```

**Return values:**
- `data` - Current query data (or placeholder data)
- `isLoading` - True if no cached data and currently fetching
- `isFetching` - True if currently fetching (including background refetches)
- `error` - Current error state
- `refetch` - Function to manually trigger refetch
- `status` - Current status: "idle" | "fetching" | "success" | "error"
- `isStale` - True if data is stale
- `updatedAt` - Timestamp of last successful fetch
- `isPlaceholderData` - True if showing placeholder data

## 🎪 Configuration

### Global Default Configuration

Set default options for all queries using `setDefaultConfig`:

```ts
import { queryManager } from "dquery-core";

// Set global defaults
queryManager.setDefaultConfig({
  staleTime: 5 * 60 * 1000, // 5 minutes default stale time
  refetchOnSubscribe: "stale", // Default refetch behavior
  throttleTime: 100, // 100ms throttle (instead of default 50ms)
  usePreviousDataOnError: true, // Keep previous data on error
  equalityFn: shallowEqual // Default equality function
});

// All new queries will use these defaults
queryManager.registerFetcher(["users"], { fetcher: fetchUsers });
// This query will have staleTime: 5 minutes, throttleTime: 100ms, etc.

// Individual queries can still override defaults
queryManager.registerFetcher(["live-data"], { 
  fetcher: fetchLiveData,
  staleTime: 0 // Override: always stale
});
```

**Available default options:**
- `enabled` - Whether queries are enabled by default
- `refetchOnSubscribe` - Default refetch behavior ("stale" | "always" | false)
- `staleTime` - Default time before data is considered stale
- `usePreviousDataOnError` - Keep previous data when errors occur
- `usePlaceholderOnError` - Use placeholder data on errors
- `equalityFn` - Default equality function for data comparison
- `throttleTime` - Default throttle time for preventing duplicate requests

### Query Keys

Query keys can be strings or arrays:

```ts
// String keys (simple)
queryManager.registerFetcher("todos", { fetcher: ... });

// Array keys (recommended for parameters)
queryManager.registerFetcher(["todos", userId], { fetcher: ... });
queryManager.registerFetcher(["user", { id: userId, include: "profile" }], { fetcher: ... });
```

### Timing Configuration

```ts
queryManager.registerFetcher(["todos"], {
  fetcher: ...,
  staleTime: 10_000, // Data considered fresh for 10 seconds
});
```

## 🎭 Error Handling Patterns

### 1. 🎯 Graceful Degradation

```tsx
function ProductList() {
  const { data: products, error } = useQuery(["products"], {
    placeholderData: [], // Show empty list while loading
    usePlaceholderOnError: true // Show empty list on error
  });

  return (
    <div>
      {error && (
        <div className="error-banner">
          ⚠️ Some products couldn't be loaded, showing cached data
        </div>
      )}
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. 🎪 Retry Logic

```tsx
function DataComponent() {
  const [retryCount, setRetryCount] = useState(0);
  
  const { data, error, refetch } = useQuery(["data"], {
    enabled: retryCount < 3 // Stop retrying after 3 attempts
  });

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  if (error && retryCount < 3) {
    return (
      <div>
        <p>❌ Something went wrong: {error.message}</p>
        <button onClick={handleRetry}>
          🔄 Try Again ({retryCount}/3)
        </button>
      </div>
    );
  }

  return <div>{/* Your content */}</div>;
}
```

### 3. 🎯 Fallback Data

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery(["user", userId], {
    placeholderData: {
      name: "Loading...",
      avatar: "/default-avatar.png",
      bio: "User information is being loaded..."
    },
    usePlaceholderOnError: true
  });

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}
```

## 🎪 Migration from Other Libraries

### From React Query / TanStack Query

```tsx
// Before (React Query)
const { data, isLoading, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  keepPreviousData: true,
  placeholderData: []
});

// After (dquery)
queryManager.registerFetcher(["todos"], {
  fetcher: fetchTodos,
  placeholderData: []
});
const { data, isLoading, error } = useQuery(["todos"]);
```

**Key differences:**
- `keepPreviousData` is now the default behavior ✅
- `placeholderData` is set at the fetcher level, not per-hook
- `refetchOnMount` becomes `refetchOnSubscribe`
- No `suspense` mode - use `isLoading` states instead

### From SWR

```tsx
// Before (SWR)
const { data, error, mutate } = useSWR("/api/todos", fetcher, {
  keepPreviousData: true
});

// After (dquery)
queryManager.registerFetcher(["todos"], {
  fetcher: () => fetch("/api/todos").then(r => r.json())
});
const { data, error, refetch } = useQuery(["todos"], {
  refetchOnSubscribe: "stale" // SWR's default behavior
});
```

**Key differences:**
- Register fetchers explicitly instead of passing fetcher to hook
- Use `refetchOnSubscribe: "stale"` for SWR's default behavior
- Previous data is always preserved (like SWR's `keepPreviousData: true`)

## 🎯 Performance Tips

### 1. 🎪 Optimize Bundle Size

```ts
// Only import what you need
import { queryManager } from "dquery-core";
import { useQuery } from "dquery-react";
```

### 2. 🎯 Use Appropriate Stale Times

```ts
// Short-lived data (real-time)
queryManager.registerFetcher(["live-data"], {
  fetcher: fetchLiveData,
  staleTime: 0 // Always stale
});

// Long-lived data (user profiles)
queryManager.registerFetcher(["user-profile"], {
  fetcher: fetchUserProfile,
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

### 3. 🎪 Batch Related Queries

```tsx
function Dashboard() {
  // These will be fetched in parallel
  const { data: user } = useQuery(["user"]);
  const { data: posts } = useQuery(["posts"]);
  const { data: comments } = useQuery(["comments"]);

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  );
}
```

## 🎪 Why Choose d-query?

- **🎯 Simple & Intuitive**: Get started in seconds, not minutes
- **⚡ Lightning Fast**: Minimal bundle size with maximum performance
- **🛡️ Production Ready**: Battle-tested with comprehensive error handling
- **🎭 Framework Agnostic**: Use with React, Vue, Svelte, or vanilla JS
- **🔄 Smart Caching**: Automatic deduplication and background updates
- **💾 Previous Data**: No loading flickers during refetches
- **🎨 TypeScript First**: Full type safety out of the box

## 📄 License

MIT License - feel free to use this in your projects! 🎉

## 🎯 Support

Need help? Have questions? Want to chat about data fetching strategies?

- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Darshan-Naik/d-query/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Darshan-Naik/d-query/discussions)
- 🌟 **Repository**: [https://github.com/Darshan-Naik/d-query](https://github.com/Darshan-Naik/d-query)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>