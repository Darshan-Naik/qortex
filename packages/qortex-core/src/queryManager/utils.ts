import type {
  QueryKey, QueryOptions, QueryState, EqualityStrategy, EqualityFn,
} from "./types";
import type { QueryStateInternal } from "./internal-types";
import { DEFAULT_STALE_TIME } from "./constants";

/**
 * Normalizes query keys to a consistent string format for internal storage
 * Arrays are joined with #, primitives are converted to strings
 */
export function serializeKey(key: QueryKey): string {
  if (Array.isArray(key)) {
    return key.map(String).join("#");
  }
  return String(key);
}

export function equal<T = unknown>(a: T | undefined, b: T | undefined, strategy: EqualityStrategy = 'shallow'): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;

  try {
    const isDeep = strategy === 'deep';
    const aArr = Array.isArray(a), bArr = Array.isArray(b);
    
    // Both must be same type (both arrays or both objects)
    if (aArr !== bArr) return false;

    if (aArr) {
      // Array comparison
      const aList = a as unknown[], bList = b as unknown[];
      if (aList.length !== bList.length) return false;
      return aList.every((val, i) => isDeep ? equal(val, bList[i], strategy) : val === bList[i]);
    }

    // Object comparison
    const aObj = a as Record<string, unknown>, bObj = b as Record<string, unknown>;
    const keys = Object.keys(aObj);
    if (keys.length !== Object.keys(bObj).length) return false;
    return keys.every(k => isDeep ? equal(aObj[k], bObj[k], strategy) : aObj[k] === bObj[k]);
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

export function createDefaultState(key:string, opts?: QueryOptions, refetch?: () => Promise<any>) {
  return {
    key,
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
  const { status, data, placeholderData, updatedAt, staleTime, isInvalidated } = state;
  
  // isStale: true when updatedAt exists and time crossed staleTime, or invalidated
  const isStale = updatedAt !== undefined
    ? (Date.now() - updatedAt > staleTime) || isInvalidated
    : isInvalidated;

  // Determine returned data based on status
  let returnedData: T | undefined;
  let isPlaceholderData = false;

  if (status === "error") {
    // On error: use previous data or placeholder based on config
    if (state.usePreviousDataOnError && data !== undefined) {
      returnedData = data;
    } else if (state.usePlaceholderOnError && placeholderData !== undefined) {
      returnedData = placeholderData;
      isPlaceholderData = true;
    }
  } else if (status === "fetching") {
    // During fetch: return existing data or placeholder
    returnedData = data ?? placeholderData;
    isPlaceholderData = data === undefined && placeholderData !== undefined;
  } else {
    // success/idle: return data or placeholder
    returnedData = data ?? placeholderData;
    isPlaceholderData = data === undefined && placeholderData !== undefined;
  }

  return {
    data: returnedData,
    error: state.error,
    status,
    updatedAt,
    isStale,
    isPlaceholderData,
    isLoading: status === "fetching" && !updatedAt,
    isFetching: status === "fetching",
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