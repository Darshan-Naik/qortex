import { useSyncExternalStore, useCallback, useRef } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, queryManager, serializeKey, InferFetcherReturnType } from "qortex-core";

/**
 * useQueryData hook for React integration with qortex
 * Provides reactive data fetching with automatic re-renders on state changes
 * Enhanced with automatic type inference from fetchers
 */

// Overload for when fetcher is provided - automatically infers return type
export function useQueryData<F extends Fetcher>(
  key: QueryKey,
  opts: QueryOptions<InferFetcherReturnType<F>> & { fetcher: F }
): InferFetcherReturnType<F> | undefined;

// Overload for explicit type without fetcher
export function useQueryData<T = any>(
  key: QueryKey,
  opts?: QueryOptions<T>
): T | undefined;

// Implementation
export function useQueryData<T = any>(
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