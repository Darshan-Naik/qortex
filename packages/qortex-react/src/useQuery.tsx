import { useSyncExternalStore, useCallback, useRef } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager, serializeKey, InferFetcherReturnType } from "qortex-core";

/**
 * useQuery hook for React integration with qortex
 * Provides reactive data fetching with automatic re-renders on state changes
 * Enhanced with automatic type inference from fetchers
 */

// Overload for when fetcher is provided - automatically infers return type
export function useQuery<F extends Fetcher>(
  key: QueryKey,
  opts: QueryOptions<InferFetcherReturnType<F>> & { fetcher: F }
): QueryState<InferFetcherReturnType<F>>;

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
    return queryManager.getQueryState<T>(key, opts);
  }, [serializedKey]);

  // Memoize the subscribe function
  const subscribe = useCallback((callback: () => void) => {
    return queryManager.subscribeQuery(key, callback, opts);
  }, [serializedKey]);

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  return state;
}