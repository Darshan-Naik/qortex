# qortex-react-legacy

React hooks for qortex that are compatible with React versions below 18 (React 16.8+ and React 17).

This package provides the same functionality as `qortex-react` but uses `useEffect` and `useState` instead of `useSyncExternalStore` for compatibility with older React versions.

## Installation

```bash
npm install qortex-react-legacy qortex-core
# or
yarn add qortex-react-legacy qortex-core
# or
pnpm add qortex-react-legacy qortex-core
```

## Usage

The API is identical to `qortex-react`. Simply import from `qortex-react-legacy` instead:

```tsx
import { useQuery, useQueryData, useQuerySelect } from 'qortex-react-legacy';
import { setQueryData } from 'qortex-core';

// Basic usage
function UserProfile() {
  const query = useQuery(['user', userId], { 
    fetcher: () => fetch(`/api/users/${userId}`).then(r => r.json())
  });

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error: {query.error?.message}</div>;
  
  return <div>Hello, {query.data?.name}!</div>;
}

// Data-only subscription
function UserName() {
  const name = useQueryData(['user', userId], { 
    fetcher: () => fetch(`/api/users/${userId}`).then(r => r.json())
  });
  
  return <div>{name}</div>;
}

// Smart subscription (only re-renders when accessed properties change)
function UserCard() {
  const query = useQuerySelect(['user', userId], { 
    fetcher: () => fetch(`/api/users/${userId}`).then(r => r.json())
  });
  
  // Only re-renders when data or isLoading changes, not when isError changes
  return (
    <div>
      <div>{query.isLoading ? 'Loading...' : query.data?.name}</div>
    </div>
  );
}
```

## React Version Compatibility

- **React 16.8+**: Full support (requires hooks)
- **React 17**: Full support
- **React 18+**: Use `qortex-react` instead for better performance with `useSyncExternalStore`

## Differences from qortex-react

- Uses `useEffect` + `useState` instead of `useSyncExternalStore`
- Slightly higher memory usage due to additional state management
- Compatible with React versions below 18
- Same API and functionality as the main `qortex-react` package

## Migration

If you're upgrading from React 17 to React 18, you can simply change your imports:

```tsx
// Before (React 17)
import { useQuery } from 'qortex-react-legacy';

// After (React 18)
import { useQuery } from 'qortex-react';
```

## License

MIT
