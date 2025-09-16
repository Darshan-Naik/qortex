import { useSyncExternalStore, useCallback, useRef } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager, serializeKey } from "dquery-core";

/**
 * useQuery hook for React integration with d-query
 * Provides reactive data fetching with automatic re-renders on state changes
 */
export function useQuery<F extends Fetcher | undefined = undefined, T = F extends Fetcher ? InferFetcherResult<F> : unknown>(
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