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
  return Array.isArray(key) ? key.join("-") : String(key);
}

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


export function getEqualityFunction<T = any>(
  strategy?: EqualityStrategy,
  customFn?: EqualityFn<T>
): EqualityFn<T> {
  if (customFn) return customFn;

  // Return a function that uses the unified equal function with the specified strategy
  return ((a: T | undefined, b: T | undefined) => equal(a, b, strategy || 'shallow')) as EqualityFn<T>;
}

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
    lastReturnedState: undefined,
    persist: opts?.persist !== false, // Default to true
  };
}

export function createPublicState<T = any, E = unknown>(state: QueryStateInternal<T, E>): QueryState<T, E> {
  const now = Date.now();
  // isStale is true only when:
  // 1. updatedAt exists and time has crossed staleTime, OR
  // 2. it's invalidated
  // In all other cases (including never fetched), it's false
  const isStale = state.updatedAt !== undefined
    ? (now - state.updatedAt > state.staleTime) || state.isInvalidated
    : state.isInvalidated;

  let returnedData = undefined;
  let isPlaceholderData = false;

  switch (state.status) {
    case "error":
      if (state.usePreviousDataOnError && state.data !== undefined) {
        returnedData = state.data;
      } else if (state.usePlaceholderOnError && state.placeholderData !== undefined) {
        returnedData = state.placeholderData;
        isPlaceholderData = true;
      }
      break;
    case "fetching":
      if (state.data !== undefined) {
        // During refetch, return existing data
        returnedData = state.data;
        isPlaceholderData = false;
      } else if (state.placeholderData) {
        // During initial fetch, return placeholder data if available
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
    error: state.error,
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

export function warnNoFetcherOrData(key: QueryKey): void {
  console.warn(
    `[qortex] No fetcher or data for key "${serializeKey(key)}". ` +
    `Register a fetcher or set initial data.`
  );
}