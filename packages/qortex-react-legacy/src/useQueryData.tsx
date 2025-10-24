import { useState, useEffect, useCallback, useRef } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, getQueryData, subscribeQuery, serializeKey } from "qortex-core";

/**
 * useQueryData hook for React integration with qortex (Legacy React < 18)
 * Provides reactive data fetching with automatic re-renders on data changes only
 * Uses useEffect and useState instead of useSyncExternalStore for React < 18 compatibility
 * Enhanced with automatic type inference from fetchers
 */

// Overload for when fetcher is provided - automatically infers return type
export function useQueryData<F extends Fetcher>(
  key: QueryKey,
  opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
): InferFetcherResult<F> | undefined;

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
  const lastDataRef = useRef<T | undefined>();

  // Initialize state with current query data
  const [data, setData] = useState<T | undefined>(() => {
    return getQueryData<T>(key, opts);
  });

  // Memoize the data updater function
  const updateData = useCallback(() => {
    const currentData = getQueryData<T>(key, opts);
    const lastData = lastDataRef.current;

    if (currentData !== lastData) {
      lastDataRef.current = currentData;
      setData(currentData);
    }
  }, [serializedKey]);

  // Subscribe to query changes with data-only filtering
  useEffect(() => {
    const unsubscribe = subscribeQuery(key, (state) => {
      const currentData = state.data;
      const lastData = lastDataRef.current;

      if (currentData !== lastData) {
        lastDataRef.current = currentData;
        setData(currentData);
      }
    }, opts);
    return unsubscribe;
  }, [serializedKey]);

  return data;
}
