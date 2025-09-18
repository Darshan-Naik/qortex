import type {
  QueryKey, QueryOptions, QueryState, EqualityStrategy, EqualityFn,
} from "./types";
import type { QueryStateInternal } from "./internal-types";
import { DEFAULT_STALE_TIME } from "./constants";

/**
 * Normalizes query keys to a consistent string format for internal storage
 * Arrays are joined with commas, primitives are converted to strings
 */
export function serializeKey(key: QueryKey): string {
  return Array.isArray(key) ? key.join(",") : String(key);
}

/**
 * Performs equality comparison between two values based on strategy
 * Handles null/undefined, primitives, and objects with same key structure
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param strategy - Comparison strategy ('shallow' or 'deep')
 * @returns true if values are equal according to the strategy
 */
export function equal<T = unknown>(a: T | undefined, b: T | undefined, strategy: EqualityStrategy = 'shallow'): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;

  try {
    const aAny = a as any;
    const bAny = b as any;

    // Handle arrays
    if (Array.isArray(aAny) && Array.isArray(bAny)) {
      if (aAny.length !== bAny.length) return false;
      for (let i = 0; i < aAny.length; i++) {
        if (strategy === 'deep') {
          if (!equal(aAny[i], bAny[i], strategy)) return false;
        } else {
          if (aAny[i] !== bAny[i]) return false;
        }
      }
      return true;
    }

    // Handle objects
    if (Array.isArray(aAny) || Array.isArray(bAny)) return false;

    const aKeys = Object.keys(aAny);
    const bKeys = Object.keys(bAny);

    if (aKeys.length !== bKeys.length) return false;

    for (let i = 0; i < aKeys.length; i++) {
      const k = aKeys[i];
      if (strategy === 'deep') {
        if (!equal(aAny[k], bAny[k], strategy)) return false;
      } else {
        if (aAny[k] !== bAny[k]) return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}


/**
 * Returns the appropriate equality function based on strategy
 * @param strategy - The equality strategy ('shallow' or 'deep')
 * @param customFn - Optional custom equality function
 * @returns The equality function to use
 */
export function getEqualityFunction<T = any>(
  strategy?: EqualityStrategy,
  customFn?: EqualityFn<T>
): EqualityFn<T> {
  if (customFn) return customFn;

  // Return a function that uses the unified equal function with the specified strategy
  return ((a: T | undefined, b: T | undefined) => equal(a, b, strategy || 'shallow')) as EqualityFn<T>;
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
    equalityFn: getEqualityFunction(opts?.equalityStrategy, opts?.equalityFn),
    equalityStrategy: opts?.equalityStrategy ?? 'shallow',
    placeholderData: opts?.placeholderData,
    usePreviousDataOnError: opts?.usePreviousDataOnError ?? false,
    usePlaceholderOnError: opts?.usePlaceholderOnError ?? false,
    refetchOnSubscribe: opts?.refetchOnSubscribe ?? "stale" as const,
    enabled: opts?.enabled === false ? false : true,
    refetch: refetch || (() => Promise.resolve(undefined)),
    isSuccess: false,
    isError: false,
  };
}

/**
 * Creates a public QueryState object from internal state
 * Handles placeholder data, stale state logic, and computed properties
 */
export function createPublicState<T = any>(state: QueryStateInternal<T>): QueryState<T> {
  const now = Date.now();
  const isStale = state.updatedAt == null || (now - (state.updatedAt || 0) > state.staleTime) || state.isInvalidated;

  let returnedData = state.data;
  let isPlaceholderData = false;

  switch (state.status) {
    case "error":
      if (state.usePlaceholderOnError && state.placeholderData !== undefined) {
        returnedData = state.placeholderData;
        isPlaceholderData = true;
      }
      break;
    case "fetching":
      if (!state.data && state.placeholderData) {
        returnedData = state.placeholderData;
        isPlaceholderData = true;
      }
      break;
    case "success":
    case "idle":
      returnedData = state.data ?? state.placeholderData;
      isPlaceholderData = state.data ? false : Boolean(state.placeholderData);
      break;
  }

  return {
    data: returnedData,
    error: state.error as Error | undefined,
    status: state.status,
    updatedAt: state.updatedAt,
    isStale,
    isPlaceholderData,
    isLoading: state.status === "fetching" && !state.updatedAt,
    isFetching: state.status === "fetching",
    isError: state.isError,
    isSuccess: state.isSuccess,
    refetch: state.refetch!,
  };
}

/**
 * Logs a developer-friendly warning when no fetcher or data is available
 * @param key - The query key that's missing fetcher/data
 */
export function warnNoFetcherOrData(key: QueryKey): void {
  console.warn(
    `[qortex] No fetcher or data for key "${serializeKey(key)}". ` +
    `Register a fetcher or set initial data.`
  );
}