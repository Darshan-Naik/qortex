# d-query (core)

A lightweight query runtime with caching, deduped fetches, and React-friendly semantics.

## Features
- Register fetchers per key; immediate prefetch on register (unless `enabled: false`)
- Stale time, cache time, eviction on last unsubscribe
- Placeholders and error fallbacks (previous data is always kept during refetch)
- Shallow equality to suppress re-renders on equal results
- Array or string keys (normalized)

## Quickstart
```ts
import { queryManager } from "d-query";

queryManager.registerFetcher(["todos"], {
  fetcher: async ({ signal }) => fetch("/api/todos", { signal }).then(r => r.json()),
  staleTime: 10_000,
  placeholderData: []
  // enabled: false // uncomment to skip immediate prefetch on register
});

// Prefetch explicitly (optional)
await queryManager.fetchQuery(["todos"]);
```

## API
- registerFetcher(key, opts)
- fetchQuery(key, opts?)
- setQueryData(key, { data })
- getQueryData(key)
- getQueryState(key)
- invalidateQuery(key)
- cancelFetch(key)
- subscribeQuery(key, cb)

See `src/types.ts` for full option types.
