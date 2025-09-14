# 🎭 dquery-react

> **React hooks for the d-query runtime. Make your React apps data-fetching awesome! ⚛️**

[![npm version](https://badge.fury.io/js/dquery-react.svg)](https://badge.fury.io/js/dquery-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dquery-react)](https://bundlephobia.com/package/dquery-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)


## ✨ What is d-query-react?

**d-query-react** is the React integration for the d-query runtime. It provides React hooks and components that make data fetching in React applications a breeze! 🎉

- 🎪 **React hooks** - `useQuery` for seamless data fetching
- ⚡ **Automatic re-renders** - Components update when data changes
- 🎯 **TypeScript support** - Full type safety with your data
- 🔄 **Background updates** - Data refreshes without loading states
- 💾 **Previous data preservation** - No loading flickers during refetches
- 🛑 **Smart cleanup** - Automatic resource management

- ⚡ **Smart throttling** - Prevents duplicate fetches from re-renders
- 🎯 **Inflight protection** - Prevents race conditions

## 🚀 Installation

```bash
pnpm add dquery-react dquery-core
# or
npm install dquery-react dquery-core
# or
yarn add dquery-react dquery-core
```

**Note:** This package depends on `react` (>=18) and `dquery-core`.

## 🎯 Quick Start

```tsx
import React from "react";
import { queryManager, useQuery } from "dquery-react";

// Register a fetcher (triggers immediate prefetch by default)
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },
  staleTime: 10_000, // 10 seconds
  placeholderData: [] // Show empty array while loading
});

export function TodosList() {
  const { data, isLoading, isFetching, error, refetch } = useQuery(["todos"], {
    refetchOnSubscribe: "stale" // Refetch if stale when component mounts
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

## 🎪 Core Features

### 🎯 Automatic Re-renders

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery(["user", userId]);

  // Component automatically re-renders when data changes
  return (
    <div>
      {isLoading ? (
        <div>Loading user...</div>
      ) : (
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      )}
    </div>
  );
}
```

### 🔄 Background Updates

```tsx
function LiveData() {
  const { data, isFetching } = useQuery(["live-stats"], {
    refetchOnSubscribe: "stale"
  });

  return (
    <div>
      {isFetching && <div>🔄 Updating in background...</div>}
      {/* Previous data remains visible during background fetch */}
      <div>Current stats: {data?.count}</div>
    </div>
  );
}
```

### 💾 Previous Data Preservation

```tsx
function PostsList() {
  const { data: posts, isFetching } = useQuery(["posts"]);

  return (
    <div>
      {isFetching && <div>🔄 Refreshing posts...</div>}
      {/* Old posts remain visible while new ones load */}
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 🎨 API Reference

### `useQuery(key, options?)`

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
  refetchOnSubscribe?: "stale" | "always" | false, // Default: false
  enabled?: boolean, // Default: true
  fetcher?: Fetcher<T>,
  staleTime?: number,
  cacheTime?: number,
  equalityFn?: (a: T, b: T) => boolean,
  signal?: AbortSignal,
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

## 🎪 Usage Examples

### 🎯 Basic Data Fetching

```tsx
import { useQuery, queryManager } from "d-query-react";

// Register fetcher
queryManager.registerFetcher(["products"], {
  fetcher: async () => {
    const response = await fetch("/api/products");
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  placeholderData: []
});

function ProductsList() {
  const { data: products, isLoading, error } = useQuery(["products"]);

  if (isLoading) return <div>🎯 Loading products...</div>;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div>
      <h2>Products ({products?.length})</h2>
      {products?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### 🎪 Conditional Fetching

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data: user, isLoading, error } = useQuery(["user", userId], {
    enabled: !!userId // Only fetch when userId exists
  });

  if (!userId) return <div>Please select a user</div>;
  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <img src={user?.avatar} alt={user?.name} />
    </div>
  );
}
```

### 🎪 Error Handling & Recovery

```tsx
function DataComponent() {
  const [retryCount, setRetryCount] = useState(0);
  
  const { data, error, refetch, isLoading } = useQuery(["data"], {
    enabled: retryCount < 3, // Stop retrying after 3 attempts
    usePlaceholderOnError: true,
    placeholderData: { message: "Loading..." }
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

  if (isLoading) return <div>🎯 Loading...</div>;

  return (
    <div>
      <h2>Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### 🎪 Optimistic Updates

```tsx
function AddTodo() {
  const { data: todos, refetch } = useQuery(["todos"]);

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
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      addTodo(formData.get('title') as string);
    }}>
      <input name="title" placeholder="New todo..." required />
      <button type="submit">➕ Add Todo</button>
    </form>
  );
}
```

### 🎪 Real-time Updates

```tsx
function LiveDashboard() {
  const { data: stats, isFetching } = useQuery(["live-stats"], {
    refetchOnSubscribe: "stale",
    staleTime: 30_000 // 30 seconds
  });

  return (
    <div>
      <div className="status">
        {isFetching ? "🔄 Updating..." : "✅ Live"}
      </div>
      <div className="stats">
        <div>Users: {stats?.users}</div>
        <div>Posts: {stats?.posts}</div>
        <div>Comments: {stats?.comments}</div>
      </div>
    </div>
  );
}
```

### 🎪 Multiple Queries

```tsx
function Dashboard() {
  // These will be fetched in parallel
  const { data: users, isLoading: usersLoading } = useQuery(["users"]);
  const { data: posts, isLoading: postsLoading } = useQuery(["posts"]);
  const { data: comments, isLoading: commentsLoading } = useQuery(["comments"]);

  const isLoading = usersLoading || postsLoading || commentsLoading;

  if (isLoading) return <div>🎯 Loading dashboard...</div>;

  return (
    <div>
      <div className="stats">
        <div>Users: {users?.length}</div>
        <div>Posts: {posts?.length}</div>
        <div>Comments: {comments?.length}</div>
      </div>
      
      <div className="content">
        <UserList users={users} />
        <PostsList posts={posts} />
        <CommentsList comments={comments} />
      </div>
    </div>
  );
}
```

### 🎪 Custom Fetcher per Hook

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery(["user", userId], {
  fetcher: async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return (
    <div>
      {user ? (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <div>Loading user...</div>
      )}
    </div>
  );
}
```

### 🎪 Conditional Fetching

```tsx
function SearchResults({ query }: { query: string }) {
  const { data: results, isLoading } = useQuery(["search", query], {
    enabled: query.length > 2,
    staleTime: 0 // Always fresh for search
  });

  return (
    <div>
      {isLoading && <div>🔍 Searching...</div>}
      {results?.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}
```

## 🎪 Advanced Patterns

### 🎯 Custom Hook Composition

```tsx
// Custom hook for user data
function useUser(userId: string) {
  return useQuery(["user", userId], {
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: { name: "Loading...", email: "" }
  });
}

// Custom hook for user posts
function useUserPosts(userId: string) {
  return useQuery(["user-posts", userId], {
    enabled: !!userId,
    staleTime: 2 * 60 * 1000
  });
}

// Composed component
function UserDashboard({ userId }: { userId: string }) {
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: posts, isLoading: postsLoading } = useUserPosts(userId);

  if (userLoading) return <div>Loading user...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      
      {postsLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div>
          <h2>Posts ({posts?.length})</h2>
          {posts?.map(post => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 🎪 Error Boundaries Integration

```tsx
class QueryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Query error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>❌ Something went wrong with data loading</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            🔄 Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <QueryErrorBoundary>
      <UserDashboard userId="123" />
    </QueryErrorBoundary>
  );
}
```

### 🎪 Suspense-like Loading States

```tsx
function LoadingBoundary({ children, fallback }: { 
  children: React.ReactNode; 
  fallback: React.ReactNode 
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? fallback : children;
}

function App() {
  return (
    <LoadingBoundary fallback={<div>🎯 Loading app...</div>}>
      <UserDashboard userId="123" />
    </LoadingBoundary>
  );
}
```

### 🎪 Performance Optimization

```tsx
// Memoized component to prevent unnecessary re-renders
const UserCard = React.memo(({ user }: { user: User }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

function UsersList() {
  const { data: users } = useQuery(["users"], {
    equalityFn: (a, b) => {
      // Custom equality check to prevent re-renders
      return a?.length === b?.length && 
             a?.every((user, index) => user.id === b?.[index]?.id);
    }
  });

  return (
    <div>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## 🎭 TypeScript Support

```tsx
// Full type safety
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

// Type-safe fetcher registration
queryManager.registerFetcher<User[]>(["users"], {
  fetcher: async (): Promise<User[]> => {
    const response = await fetch("/api/users");
    return response.json();
  }
});

// Type-safe hook usage
function UsersList() {
  const { data: users, isLoading, error } = useQuery<User[]>(["users"]);
  
  // users is typed as User[] | undefined
  // isLoading is typed as boolean
  // error is typed as any (you can make this more specific)

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
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

// After (dquery-react)
queryManager.registerFetcher(["todos"], {
  fetcher: fetchTodos,
  placeholderData: []
});
const { data, isLoading, error } = useQuery(["todos"]);
```

### From SWR

```tsx
// Before (SWR)
const { data, error, mutate } = useSWR("/api/todos", fetcher, {
  keepPreviousData: true
});

// After (dquery-react)
queryManager.registerFetcher(["todos"], {
  fetcher: () => fetch("/api/todos").then(r => r.json())
});
const { data, error, refetch } = useQuery(["todos"], {
  refetchOnSubscribe: "stale" // SWR's default behavior
});
```

### From Apollo Client

```tsx
// Before (Apollo)
const { data, loading, error } = useQuery(GET_TODOS);

// After (dquery-react)
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_TODOS })
    });
    return response.json();
  }
});
const { data, isLoading, error } = useQuery(["todos"]);
```

## 🎯 Performance Tips

### 1. 🎪 Optimize Re-renders

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
function DataVisualization({ data }) {
  const processedData = useMemo(() => {
    return data?.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [data]);

  return <Chart data={processedData} />;
}
```

### 2. 🎯 Batch Updates

```tsx
// Multiple queries will be batched automatically
function Dashboard() {
  const { data: users } = useQuery(["users"]);
  const { data: posts } = useQuery(["posts"]);
  const { data: comments } = useQuery(["comments"]);

  // All three queries will be fetched in parallel
  return (
    <div>
      <UserList users={users} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  );
}
```

### 3. 🎪 Smart Caching

```tsx
// Use appropriate stale times
queryManager.registerFetcher(["user-profile"], {
  fetcher: fetchUserProfile,
  staleTime: 5 * 60 * 1000 // 5 minutes
});

queryManager.registerFetcher(["live-data"], {
  fetcher: fetchLiveData,
  staleTime: 0 // Always stale
});
```

## 🎭 Development

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

Need help? Have questions? Want to chat about React data fetching strategies?

- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Darshan-Naik/d-query/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Darshan-Naik/d-query/discussions)
- 🌟 **Repository**: [https://github.com/Darshan-Naik/d-query](https://github.com/Darshan-Naik/d-query)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>