import { useSyncExternalStore, useCallback } from "react";
import {
  QueryKey,
  Fetcher,
  InferFetcherResult,
  QueryOptions,
  queryManager,
  serializeKey,
} from "qortex-core";

/**
 * React hook for reactive data fetching that returns only the data value
 *
 * @param key - Unique identifier for the query (string or array of primitives)
 * @param opts - Query configuration options
 * @param opts.fetcher - Async function that fetches data for this query
 * @param opts.enabled - Whether the query should be active (default: true)
 * @param opts.staleTime - Time in ms before data is considered stale (default: 0)
 * @param opts.equalityStrategy - How to compare data for changes ('shallow' | 'deep')
 * @param opts.equalityFn - Custom equality function for data comparison
 * @param opts.refetchOnSubscribe - When to refetch on subscription ('always' | 'stale' | false)
 * @param opts.placeholderData - Initial data to show while loading
 * @param opts.usePreviousDataOnError - Keep previous data when error occurs
 * @param opts.usePlaceholderOnError - Use placeholder data when error occurs
 * @returns The current data value or undefined if not available
 *
 * Similar to useQuery but returns only the data value instead of the full QueryState object.
 * Returns undefined if the query has never been fetched, is loading, or if an error occurred.
 * Automatically subscribes to query state changes and triggers re-renders when the data updates.
 * Enhanced with automatic type inference from fetcher functions. Handles mount logic to potentially start fetching.
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

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): T | undefined => {
    return queryManager.getQueryData<T>(key, opts);
  }, [serializedKey]);

  // Memoize the subscribe function
  const subscribe = useCallback(
    (callback: () => void) => {
      return queryManager.subscribeQuery(key, callback, opts);
    },
    [serializedKey]
  );

  const data = useSyncExternalStore(subscribe, getSnapshot);

  return data;
}
