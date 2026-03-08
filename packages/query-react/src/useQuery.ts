import { useSyncExternalStore, useCallback } from "react";
import {
  QueryKey,
  Fetcher,
  InferFetcherResult,
  QueryOptions,
  QueryState,
  queryManager,
  serializeKey,
} from "qortex-query";

/**
 * React hook for reactive data fetching with automatic re-renders on state changes
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
 * @returns QueryState object with data, error, status, and computed flags
 *
 * Returns an object containing:
 * - data: The current data value
 * - error: Any error that occurred during fetching
 * - status: Current status ('idle' | 'fetching' | 'success' | 'error')
 * - isStale: Whether the data is considered stale
 * - isLoading: Whether the query is currently loading
 * - isFetching: Whether a fetch is in progress
 * - isError: Whether the query is in an error state
 * - isSuccess: Whether the query completed successfully
 * - refetch: Function to manually trigger a refetch
 *
 * Automatically subscribes to query state changes and triggers re-renders when the state updates.
 * Enhanced with automatic type inference from fetcher functions. Handles mount logic to potentially start fetching.
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
    return queryManager.getQueryState<T>(key, opts);
  }, [serializedKey]);

  // Memoize the subscribe function
  const subscribe = useCallback(
    (callback: () => void) => {
      return queryManager.subscribeQuery(key, callback, opts);
    },
    [serializedKey]
  );

  const state = useSyncExternalStore(subscribe, getSnapshot);

  return state;
}
