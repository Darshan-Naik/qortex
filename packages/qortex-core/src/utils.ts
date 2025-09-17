import type {
  QueryKey, QueryOptions,
} from "./types";
import { DEFAULT_STALE_TIME } from "./constants";

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
export function createDefaultState(opts?: QueryOptions, refetch?: () => Promise<any>) {
  return {
    status: "idle" as const,
    updatedAt: undefined,
    staleTime: opts?.staleTime ?? DEFAULT_STALE_TIME,
    isInvalidated: false,
    fetcher: opts?.fetcher,
    equalityFn: opts?.equalityFn ?? shallowEqual,
    placeholderData: opts?.placeholderData,
    usePreviousDataOnError: opts?.usePreviousDataOnError ?? false,
    usePlaceholderOnError: opts?.usePlaceholderOnError ?? false,
    refetchOnSubscribe: opts?.refetchOnSubscribe ?? "stale" as const,
    enabled: opts?.enabled === false ? false : true,
    refetch: refetch || (() => Promise.resolve(undefined)),
  };
}