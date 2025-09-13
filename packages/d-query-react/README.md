# d-query-react (React bridge)

React hooks for the d-query runtime.

## Install
This package depends on `react` and `d-query`.

## useQuery
```tsx
import { useQuery, queryManager } from "d-query-react";

// Bootstrap fetcher (register triggers prefetch by default)
queryManager.registerFetcher(["todos"], {
  fetcher: async ({ signal }) => fetch("/api/todos", { signal }).then(r => r.json()),
  staleTime: 10_000,
  placeholderData: [],
  // enabled: false // uncomment to skip immediate prefetch on register
});

export function Todos() {
  const { data, isLoading, isFetching, refetch } = useQuery(["todos"], { refetchOnSubscribe: "stale" });

  if (isLoading) return <p>Loading…</p>;
  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>Refetch</button>
      <ul>{data?.map((t: any) => <li key={t.id}>{t.text}</li>)}</ul>
    </div>
  );
}
```

Notes:
- Keys can be strings or arrays; arrays are normalized.
- Multiple components share a single query per key. Fetches are deduped.
- Placeholders, keep-previous-data, and error fallbacks are centralized in the runtime; you can seed them via `useQuery` on first mount.
