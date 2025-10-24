import type { Persister } from "../persister";

/** 
 * Query key can be a string or readonly array of strings/numbers
 * Using readonly to prevent accidental mutations
 */
export type QueryKey = string | readonly (string | number)[];


/** Function that fetches data, must be async */
export type Fetcher<T = any> = () => Promise<T>;

/** Function that compares two values for equality */
export type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

/** Strategy for equality comparison */
export type EqualityStrategy = 'shallow' | 'deep';

/** 
 * Infers the return type of a fetcher function
 * 
 * This utility type extracts the return type from a fetcher function,
 * handling both synchronous and asynchronous fetchers.
 * 
 * @example
 * ```typescript
 * const fetchUser = async (id: string): Promise<User> => { ... };
 * type UserType = InferFetcherResult<typeof fetchUser>; // Promise<User>
 * 
 * const fetchConfig = (): Config => { ... };
 * type ConfigType = InferFetcherResult<typeof fetchConfig>; // Config
 * ```
 * 
 * @template F - The fetcher function type
 * @returns The inferred return type of the fetcher, or `any` if inference fails
 */
export type InferFetcherResult<F> = F extends Fetcher<infer R> ? R : any;


/**
 * Query status types for better type safety
 */
export type QueryStatus = "idle" | "fetching" | "success" | "error";

export type RefetchOnSubscribeOptions = "always" | "stale" | false;

/**
 * Comprehensive options for all query operations
 * Improved with better type constraints
 */
export type QueryOptions<T = any> = {
  enabled?: boolean;
  refetchOnSubscribe?: RefetchOnSubscribeOptions;
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  equalityStrategy?: EqualityStrategy;
  staleTime?: number;
  signal?: AbortSignal;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};

/**
 * Default configuration options that can be set globally
 * Includes throttleTime which is not part of regular QueryOptions
 */
export type DefaultConfig = {
  enabled?: boolean;
  refetchOnSubscribe?: RefetchOnSubscribeOptions;
  staleTime?: number;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
  equalityFn?: EqualityFn<any>;
  equalityStrategy?: EqualityStrategy;
  throttleTime?: number;
  persister?: Persister;
};

/**
 * Public query state returned by getQueryState
 * Improved with stricter error typing and better generic constraints
 */
export type QueryState<T = any, E = unknown> = {
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
