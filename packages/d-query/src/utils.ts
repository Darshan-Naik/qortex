import type { QueryKey, EqualityFn, Fetcher } from "./types";
import { DEFAULT_CACHE_TIME, DEFAULT_KEEP_PREVIOUS_DATA, DEFAULT_PLACEHOLDER_DATA, DEFAULT_STALE_TIME } from "./constants";

/**
 * Normalizes query keys to a consistent string format for internal storage
 * Arrays are joined with commas, primitives are converted to strings
 */
export function serializeKey(key: QueryKey): string {
  return Array.isArray(key) ? key.join(",") : String(key);
}

/**
 * Performs shallow structural equality comparison between two values
 * Handles null/undefined, primitives, and objects with same key structure
 */
export function shallowEqual<T = unknown>(a: T | undefined, b: T | undefined): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;
  
  try {
    const aAny = a as any;
    const bAny = b as any;
    const aKeys = Object.keys(aAny);
    const bKeys = Object.keys(bAny);
    
    if (aKeys.length !== bKeys.length) return false;
    
    for (let i = 0; i < aKeys.length; i++) {
      const k = aKeys[i];
      if (aAny[k] !== bAny[k]) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new query state with default values
 * Used when initializing queries that don't exist in cache
 */
export function createDefaultState<T = unknown>(fetcher: Fetcher<T> | null) {
  return {
    status: "idle" as const,
    updatedAt: null as number | null,
    subscribers: 0,
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME,
    fetchPromise: null as Promise<T> | null,
    fetchController: null as AbortController | null,
    isInvalidated: false,
    fetcher,
    equalityFn: undefined as EqualityFn<T> | undefined,
    placeholderData: DEFAULT_PLACEHOLDER_DATA as T | undefined,
    usePreviousDataOnError: false,
    usePlaceholderOnError: false,
    hasBeenMounted: false,
    lastMountTime: null as number | null,
    wasEnabledOnFirstMount: false,
    refetchOnSubscribe: "stale" as const,
    lastFetchTime: null as number | null,
  };
}