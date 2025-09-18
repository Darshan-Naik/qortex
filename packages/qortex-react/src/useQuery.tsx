import { useSyncExternalStore, useCallback } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, subscribeQuery, getQueryState, serializeKey } from "qortex-core";

/**
 * useQuery hook for React integration with qortex
 * Provides reactive data fetching with automatic re-renders on state changes
 * Enhanced with automatic type inference from fetchers
 */

// Overload for when fetcher is provided - automatically infers return type
export function useQuery<F extends Fetcher>(
  key: QueryKey,
  opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
): QueryState<InferFetcherResult<F>>;

// Overload for explicit type without fetcher
export function useQuery<T = any>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T>;

// Implementation
export function useQuery<T = any>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T> {

  const serializedKey = serializeKey(key);

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): QueryState<T> => {
    return getQueryState<T>(key, opts);
  }, [serializedKey]);

  // Memoize the subscribe function
  const subscribe = useCallback((callback: () => void) => {
    return subscribeQuery(key, callback, opts);
  }, [serializedKey]);

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  return state;
}