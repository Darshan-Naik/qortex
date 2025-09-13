# d-query

A minimal, performant data fetching library with React integration. Built for simplicity and efficiency.

## Packages

- **`d-query`** - Core runtime with query management
- **`d-query-react`** - React hooks and components

## Quick Start

```bash
# Install dependencies
pnpm install

# Build packages
pnpm run build

# Run example app
pnpm --filter react-app run dev
```

## Installation

```bash
# Core runtime
pnpm add d-query

# React integration
pnpm add d-query-react
```

## Core Features

- **Automatic caching** with configurable stale time and cache time
- **Background refetching** with smart invalidation
- **Previous data preservation** during refetches (no loading states for cached data)
- **Shallow equality** to prevent unnecessary re-renders
- **AbortController** support for request cancellation
- **TypeScript** support with full type safety

## Usage

### 1. Setup Query Manager

```ts
import { queryManager } from "d-query";

// Register a fetcher (triggers immediate prefetch by default)
queryManager.registerFetcher(["todos"], {
  fetcher: async ({ signal }) => {
    const response = await fetch("/api/todos", { signal });
    return response.json();
  },
  staleTime: 10_000, // 10 seconds
  cacheTime: 5 * 60 * 1000, // 5 minutes
  placeholderData: [], // Show empty array while loading
  // enabled: false // Skip immediate prefetch on register
});
```

### 2. React Integration

```tsx
import { useQuery } from "d-query-react";

function TodosList() {
  const { data, isLoading, isFetching, error, refetch } = useQuery(["todos"], {
    refetchOnSubscribe: "stale" // Refetch if data is stale when component mounts
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Refreshing..." : "Refresh"}
      </button>
      <ul>
        {data?.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Manual Query Management

```ts
import { queryManager } from "d-query";

// Fetch data manually
const todos = await queryManager.fetchQuery(["todos"]);

// Update cache directly
queryManager.setQueryData(["todos"], { data: newTodos });

// Invalidate and refetch
queryManager.invalidateQuery(["todos"]);

// Cancel ongoing request
queryManager.cancelFetch(["todos"]);

// Subscribe to query state changes
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("Query state:", state);
});
```

## API Reference

### Core Runtime (`d-query`)

#### `queryManager.registerFetcher(key, options)`

Register a fetcher function for a query key.

```ts
queryManager.registerFetcher(key, {
  fetcher: async ({ signal }) => Promise<T>,
  staleTime?: number, // Default: 0
  cacheTime?: number, // Default: 5 minutes
  placeholderData?: T, // Default: undefined
  enabled?: boolean, // Default: true
  equalityFn?: (a: T, b: T) => boolean // Default: shallow equality
});
```

#### `queryManager.fetchQuery(key, options?)`

Manually fetch data for a query.

```ts
const data = await queryManager.fetchQuery(key, {
  signal?: AbortSignal,
  equalityFn?: (a: T, b: T) => boolean
});
```

#### `queryManager.setQueryData(key, { data })`

Update query cache directly.

```ts
queryManager.setQueryData(["todos"], { data: newTodos });
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
// Returns: { data, error, isLoading, isFetching, isStale, lastFetched }
```

#### `queryManager.invalidateQuery(key)`

Mark query as stale and trigger refetch.

```ts
queryManager.invalidateQuery(["todos"]);
```

#### `queryManager.cancelFetch(key)`

Cancel ongoing fetch request.

```ts
queryManager.cancelFetch(["todos"]);
```

#### `queryManager.subscribeQuery(key, callback)`

Subscribe to query state changes.

```ts
const unsubscribe = queryManager.subscribeQuery(["todos"], (state) => {
  console.log("State changed:", state);
});
```

### React Integration (`d-query-react`)

#### `useQuery(key, options?)`

React hook for query data.

```tsx
const { data, isLoading, isFetching, error, refetch } = useQuery(key, {
  refetchOnSubscribe?: "stale" | "always" | false, // Default: false
  enabled?: boolean // Default: true
});
```

**Return values:**
- `data` - Current query data (or placeholder data)
- `isLoading` - True if no cached data and currently fetching
- `isFetching` - True if currently fetching (including background refetches)
- `error` - Current error state
- `refetch` - Function to manually trigger refetch

## Advanced Usage

### Custom Equality Function

```ts
import { isEqual } from "lodash";

queryManager.registerFetcher(["todos"], {
  fetcher: async () => fetch("/api/todos").then(r => r.json()),
  equalityFn: isEqual // Deep equality comparison
});
```

### Conditional Fetching

```tsx
function UserProfile({ userId }) {
  const { data: user } = useQuery(["user", userId], {
    enabled: !!userId // Only fetch when userId exists
  });

  return user ? <div>{user.name}</div> : null;
}
```

### Background Refetching

```tsx
function TodosList() {
  const { data, isFetching } = useQuery(["todos"], {
    refetchOnSubscribe: "stale" // Refetch if stale when component mounts
  });

  return (
    <div>
      {isFetching && <div>Updating in background...</div>}
      {/* Previous data remains visible during background fetch */}
      {data?.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </div>
  );
}
```

### Manual Cache Management

```tsx
function AddTodo() {
  const addTodo = async (title) => {
    const newTodo = await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title })
    }).then(r => r.json());

    // Update cache optimistically
    queryManager.setQueryData(["todos"], (oldData) => [
      ...(oldData || []),
      newTodo
    ]);
  };

  return <button onClick={() => addTodo("New todo")}>Add Todo</button>;
}
```

## Configuration

### Query Keys

Query keys can be strings or arrays:

```ts
// String keys
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
  cacheTime: 5 * 60 * 1000, // Cache kept for 5 minutes after last unsubscribe
});
```

## Migration from Other Libraries

### From React Query / TanStack Query

- `keepPreviousData` is now the default behavior
- `placeholderData` is set at the fetcher level, not per-hook
- `refetchOnMount` becomes `refetchOnSubscribe`
- No `suspense` mode - use `isLoading` states instead

### From SWR

- Register fetchers explicitly instead of passing fetcher to hook
- Use `refetchOnSubscribe: "stale"` for SWR's default behavior
- Previous data is always preserved (like SWR's `keepPreviousData: true`)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run type checking
pnpm run type-check

# Run example app
pnpm --filter react-app run dev
```

## License

MIT
