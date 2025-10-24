import { useState, useEffect, useCallback } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, subscribeQuery, getQueryState, serializeKey } from "qortex-core";

/**
 * useQuery hook for React integration with qortex (Legacy React < 18)
 * Provides reactive data fetching with automatic re-renders on state changes
 * Uses useEffect and useState instead of useSyncExternalStore for React < 18 compatibility
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
  
  // Initialize state with current query state
  const [state, setState] = useState<QueryState<T>>(() => {
    return getQueryState<T>(key, opts);
  });

  // Memoize the state updater function
  const updateState = useCallback(() => {
    setState(getQueryState<T>(key, opts));
  }, [serializedKey]);

  // Subscribe to query changes
  useEffect(() => {
    const unsubscribe = subscribeQuery(key, updateState, opts);
    return unsubscribe;
  }, [serializedKey, updateState]);

  return state;
}
