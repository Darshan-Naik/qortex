import { useSyncExternalStore, useCallback, useRef, useMemo } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, subscribeQuery, getQueryState, serializeKey } from "qortex-core";

/**
 * useQuerySelect hook for React integration with qortex
 * Provides reactive data fetching with automatic re-renders on state changes
 * Enhanced with automatic type inference from fetchers
 * 
 * Now includes smart subscription: automatically detects which properties are accessed
 * and only re-renders when those specific properties change, not the entire state.
 * 
 * @example
 * ```tsx
 * const query = useQuerySelect('users', { fetcher: fetchUsers });
 * 
 * // Only re-renders when data or isSuccess changes, not when isError changes
 * return <div>{query.isSuccess ? query.data?.name : 'Loading...'}</div>;
 * ```
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
  const subscribe = useCallback((callback: () => void) => {
    return subscribeQuery(key, (newState: QueryState<T>) => {
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
        if (lastState?.[prop as keyof QueryState<T>] !== newState[prop as keyof QueryState<T>]) {
          hasChanged = true;
          break;
        }
      }

      if (hasChanged) {
        lastStateRef.current = newState;
        callback();
      }
    }, opts);
  }, [serializedKey]);

  // Memoize the getSnapshot function
  const getSnapshot = useCallback((): QueryState<T> => {
    return getQueryState<T>(key, opts);
  }, [serializedKey]);

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );

  // Create a proxy that tracks property access during render
  const smartState = useMemo(() => {
    return new Proxy(state, {
      get(target, prop: keyof QueryState<T>) {
        // Track which properties are accessed during render
        accessedPropertiesRef.current.add(prop);
        return target[prop];
      }
    });
  }, [state]);

  return smartState;
}