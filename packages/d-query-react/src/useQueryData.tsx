import { useSyncExternalStore, useCallback, useRef } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager, serializeKey } from "dquery-core";

/**
 * useQueryData hook for React integration with d-query
 * Provides reactive data fetching with automatic re-renders on state changes
 */
export function useQueryData<F extends Fetcher | undefined = undefined, T = F extends Fetcher ? InferFetcherResult<F> : unknown>(
  key: QueryKey,
  opts?: QueryOptions<T>
): T | undefined {

  const serializedKey = serializeKey(key);

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): T | undefined => {
    return queryManager.getQueryData<T>(key, opts);
  }, [serializedKey]);

  // Memoize the subscribe function
  const subscribe = useCallback((callback: () => void) => {
    return queryManager.subscribeQuery(key, callback, opts);
  }, [serializedKey]);

  const data = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  return data;
}