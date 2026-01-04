import { useSyncExternalStore, useCallback, useRef, useMemo } from "react";
import {
  QueryKey,
  Fetcher,
  InferFetcherResult,
  QueryOptions,
  QueryState,
  queryManager,
  serializeKey,
} from "qortex-core";

/**
 * React hook for reactive data fetching with smart subscription optimization
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
 * Features smart subscription optimization: automatically detects which properties are accessed
 * during render and only triggers re-renders when those specific properties change, not the entire state.
 * This prevents unnecessary re-renders when unrelated properties change, improving performance.
 * Enhanced with automatic type inference from fetcher functions. Handles mount logic to potentially start fetching.
 */

// Overload for when fetcher is provided - automatically infers return type
export function useQuerySelect<F extends Fetcher>(
  key: QueryKey,
  opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
): QueryState<InferFetcherResult<F>>;

// Overload for explicit type without fetcher
export function useQuerySelect<T = any>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T>;

// Implementation
export function useQuerySelect<T = any>(
  key: QueryKey,
  opts?: QueryOptions<T>
): QueryState<T> {
  const serializedKey = serializeKey(key);
  const lastStateRef = useRef<QueryState<T>>();
  const accessedPropertiesRef = useRef<Set<string>>(new Set());

  // Create a smart subscription that only triggers when accessed properties change
  const subscribe = useCallback(
    (callback: () => void) => {
      return queryManager.subscribeQuery(
        key,
        (newState: QueryState<T>) => {
          const lastState = lastStateRef.current;
          const accessedProps = accessedPropertiesRef.current;

          // If no properties have been accessed yet, subscribe to everything
          if (accessedProps.size === 0) {
            lastStateRef.current = newState;
            callback();
            return;
          }

          // Check if any accessed properties have changed
          let hasChanged = false;
          for (const prop of accessedProps) {
            if (
              lastState?.[prop as keyof QueryState<T>] !==
              newState[prop as keyof QueryState<T>]
            ) {
              hasChanged = true;
              break;
            }
          }

          if (hasChanged) {
            lastStateRef.current = newState;
            callback();
          }
        },
        opts
      );
    },
    [serializedKey]
  );

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): QueryState<T> => {
    return queryManager.getQueryState<T>(key, opts);
  }, [serializedKey]);

  const state = useSyncExternalStore(subscribe, getSnapshot);

  // Create a proxy that tracks property access during render
  const smartState = useMemo(() => {
    return new Proxy(state, {
      get(target, prop: keyof QueryState<T>) {
        // Track which properties are accessed during render
        accessedPropertiesRef.current.add(prop);
        return target[prop];
      },
    });
  }, [state]);

  return smartState;
}
