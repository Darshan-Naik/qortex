# 🎭 dquery-react

> **React hooks for universal data access. Set and read data from anywhere! ⚛️**

[![npm version](https://badge.fury.io/js/dquery-react.svg)](https://badge.fury.io/js/dquery-react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/dquery-react)](https://bundlephobia.com/package/dquery-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## ✨ What makes this special?

**d-query-react** lets you **set and read data from anywhere** - not just React components! Perfect for:

- 🔐 **App core data** - Authentication, user profiles accessible from anywhere
- 🔄 **Background services** - WebSocket updates, timers, external events
- 🎯 **Cross-component communication** - No more prop drilling
- ⚡ **Real-time updates** - Push changes from anywhere, see them in React instantly

```bash
pnpm add dquery-react dquery-core
```

```tsx
import { queryManager, useQuery, useQueryData } from "dquery-react";

// Register a fetcher
queryManager.registerFetcher(["todos"], {
  fetcher: async () => {
    const response = await fetch("/api/todos");
    return response.json();
  },
  staleTime: 10_000, // 10 seconds
  placeholderData: []
});

// Use in React component - full query state
function TodosList() {
  const { data, isLoading, error, refetch } = useQuery(["todos"]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

// Or just get the data - perfect for simple data access
function TodoCount() {
  const todos = useQueryData(["todos"]);
  return <div>Total todos: {todos?.length || 0}</div>;
}
```

## 🔐 Perfect for Authentication

```tsx
// Auth service - update from anywhere
class AuthService {
  async login(email: string, password: string) {
    const { user, token } = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
    
    // 🎯 Update auth state - all components update automatically!
    queryManager.setQueryData(["auth", "user"], user);
    queryManager.setQueryData(["auth", "isAuthenticated"], true);
  }
  
  logout() {
    // 🎯 Clear auth state from anywhere
    queryManager.setQueryData(["auth", "user"], null);
    queryManager.setQueryData(["auth", "isAuthenticated"], false);
  }
}

// React components automatically reflect changes
function UserProfile() {
  const { data: user } = useQuery(["auth", "user"]);
  const { data: isAuthenticated } = useQuery(["auth", "isAuthenticated"]);
  
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
        <div>
          <h2>{user?.name}</h2>
      <button onClick={() => AuthService.logout()}>Logout</button>
        </div>
  );
}

// Or use useQueryData for simpler data access
function UserAvatar() {
  const user = useQueryData(["auth", "user"]);
  const isAuthenticated = useQueryData(["auth", "isAuthenticated"]);
  
  if (!isAuthenticated) return null;
  
  return <img src={user?.avatar} alt={user?.name} />;
}
```

## 🎨 API Reference

### `useQuery(key, options?)`

Returns the full query state with loading, error, and refetch capabilities:

```tsx
const { 
  data, 
  isLoading, 
  isFetching, 
  error, 
  refetch,
  status,
  isStale,
  updatedAt
} = useQuery(key, {
  refetchOnSubscribe?: "stale" | "always" | false, // Default: "stale"
  enabled?: boolean, // Default: true
  fetcher?: Fetcher<T>,
  staleTime?: number,
  placeholderData?: T
});
```

### `useQueryData(key, options?)`

Returns just the data - perfect for simple data access without loading states:

```tsx
const data = useQueryData(key, {
  refetchOnSubscribe?: "stale" | "always" | false, // Default: "stale"
  enabled?: boolean, // Default: true
  fetcher?: Fetcher<T>,
  staleTime?: number,
  placeholderData?: T
});

// Returns T | undefined
```

**When to use which:**
- **`useQuery`** - When you need loading states, error handling, or refetch capabilities
- **`useQueryData`** - When you just need the data and want a simpler API

### `queryManager.setQueryData(key, data)`

Update data from anywhere:

```tsx
// Direct update
queryManager.setQueryData(["todos"], newTodos);

// Functional update
queryManager.setQueryData(["todos"], (oldData) => [
  ...(oldData || []),
  newTodo
]);
```

### `queryManager.getQueryData(key)`

Read data from anywhere:

```tsx
const user = queryManager.getQueryData(["auth", "user"]);
const isAuthenticated = queryManager.getQueryData(["auth", "isAuthenticated"]);
```

## 🎯 More Examples

### WebSocket Updates

```tsx
// Update data from WebSocket
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  queryManager.setQueryData(["live-stats"], data);
};

// React component automatically updates
function LiveStats() {
  const { data: stats } = useQuery(["live-stats"]);
  return <div>Users online: {stats?.users}</div>;
}

// Or use useQueryData for simpler access
function UserCount() {
  const stats = useQueryData(["live-stats"]);
  return <span>{stats?.users || 0}</span>;
}
```

### Cross-Component Communication

```tsx
// Component A updates data
function UserActions({ userId }) {
  const updateStatus = (status) => {
    queryManager.setQueryData(["user", userId], (user) => ({
      ...user,
      status
    }));
  };
  
  return (
    <div>
      <button onClick={() => updateStatus("online")}>Set Online</button>
    </div>
  );
}

// Component B automatically reflects changes
function UserStatus({ userId }) {
  const { data: user } = useQuery(["user", userId]);
  return <div>Status: {user?.status}</div>;
}

// Or use useQueryData for simpler data access
function UserName({ userId }) {
  const user = useQueryData(["user", userId]);
  return <span>{user?.name}</span>;
}
```

## 🎭 TypeScript Support

```tsx
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

function UsersList() {
  const { data: users, isLoading, error } = useQuery<User[]>(["users"]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}

// Or use useQueryData for simpler typed access
function UserCount() {
  const users = useQueryData<User[]>(["users"]);
  return <div>Total users: {users?.length || 0}</div>;
}
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