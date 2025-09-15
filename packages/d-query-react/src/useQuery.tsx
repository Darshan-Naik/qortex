import { useSyncExternalStore, useCallback } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager } from "dquery-core";

/**
 * useQuery hook for React integration with d-query
 * Provides reactive data fetching with automatic re-renders on state changes
 */
export function useQuery<F extends Fetcher | undefined = undefined, T = F extends Fetcher ? InferFetcherResult<F> : unknown>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T> {

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): QueryState<T> => {
    console.log("getSnapshot called");
    return queryManager.getQueryState<T>(key, opts);
  }, [key]);

  // Memoize the subscribe function
  const subscribe = useCallback((callback: () => void) => {
    console.log("subscribe called");

    return queryManager.subscribeQuery(key, callback, opts);
  }, [key]);

  // Use React's useSyncExternalStore for optimal performance
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  return state;
}