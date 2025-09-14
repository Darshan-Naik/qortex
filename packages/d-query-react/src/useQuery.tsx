import { useSyncExternalStore, useMemo, useCallback } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager } from "dquery-core";

/**
 * useQuery hook for React integration with d-query
 * Provides reactive data fetching with automatic re-renders on state changes
 */
export function useQuery<F extends Fetcher | undefined = undefined, T = F extends Fetcher ? InferFetcherResult<F> : unknown>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T> {
  // Memoize options to prevent unnecessary re-renders
  const memoOpts = useMemo(() => opts || {}, [opts]);

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): QueryState<T> => {
    return queryManager.getQueryState<T>(key, memoOpts);
  }, [key, memoOpts]);

  // Memoize the subscribe function
  const subscribe = useCallback((callback: () => void) => {
    return queryManager.subscribeQuery(key, callback, memoOpts);
  }, [key, memoOpts]);

  // Use React's useSyncExternalStore for optimal performance
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // Server snapshot (same as client for now)
  );

  return state;
}