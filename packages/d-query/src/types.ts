/** 
 * Query key can be a string or readonly array of strings/numbers
 * Using readonly to prevent accidental mutations
 */
export type QueryKey = string | readonly (string | number)[];

/** Valid query key values - only strings and numbers are allowed */
export type QueryKeyValue = string | number;

/** Function that fetches data, can be async or sync */
export type Fetcher<T = any> = () => Promise<T> | T;

/** Function that compares two values for equality */
export type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

/** 
 * Infers the resolved return type of a fetcher function
 * Falls back to any for user-friendly experience
 */
export type InferFetcherResult<F> =
  F extends (...args: any[]) => Promise<infer R> ? R :
  F extends (...args: any[]) => infer R ? R :
  any;

/** 
 * Infers the return type of a fetcher, handling both sync and async cases
 * Falls back to any for user-friendly experience
 */
export type InferFetcherReturnType<T> = T extends Fetcher<infer R> ? R : any;

/**
 * Query status types for better type safety
 */
export type QueryStatus = "idle" | "fetching" | "success" | "error";

/**
 * Comprehensive options for all query operations
 * Improved with better type constraints
 */
export type QueryOptions<T = any> = {
  enabled?: boolean;
  refetchOnSubscribe?: "always" | "stale" | false;
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  staleTime?: number;
  signal?: AbortSignal;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};

/**
 * Public query state returned by getQueryState
 * Improved with stricter error typing and better generic constraints
 */
export type QueryState<T = any, E = Error> = {
  data?: T;
  error?: E;
  status: QueryStatus;
  updatedAt?: number;
  isStale: boolean;
  isPlaceholderData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<T>;
};
