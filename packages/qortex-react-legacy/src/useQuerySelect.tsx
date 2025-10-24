import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { QueryKey, Fetcher, InferFetcherResult, QueryOptions, QueryState, subscribeQuery, getQueryState, serializeKey } from "qortex-core";

/**
 * useQuerySelect hook for React integration with qortex (Legacy React < 18)
 * Provides reactive data fetching with smart subscription optimization
 * Uses useEffect and useState instead of useSyncExternalStore for React < 18 compatibility
 * Enhanced with automatic type inference from fetchers
 * 
 * Smart subscription: automatically detects which properties are accessed
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

  // Initialize state with current query state
  const [state, setState] = useState<QueryState<T>>(() => {
    return getQueryState<T>(key, opts);
  });

  // Memoize the state updater function with smart subscription logic
  const updateState = useCallback((newState: QueryState<T>) => {
    const lastState = lastStateRef.current;
    const accessedProps = accessedPropertiesRef.current;

    // If no properties have been accessed yet, update on any change
    if (accessedProps.size === 0) {
      lastStateRef.current = newState;
      setState(newState);
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
      setState(newState);
    }
  }, [serializedKey]);

  // Subscribe to query changes with smart subscription
  useEffect(() => {
    const unsubscribe = subscribeQuery(key, updateState, opts);
    return unsubscribe;
  }, [serializedKey, updateState]);

  // Create a proxy that tracks property access during render
  const smartState = useMemo(() => {
    return new Proxy(state, {
      get(target, prop: keyof QueryState<T>) {
        // Track which properties are accessed during render
        if (typeof prop === 'string') {
          accessedPropertiesRef.current.add(prop);
        }
        return target[prop];
      }
    });
  }, [state]);

  return smartState;
}
