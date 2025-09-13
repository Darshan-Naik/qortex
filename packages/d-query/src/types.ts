/**
 * Core type definitions for the query system
 */

/** Query key can be a string or array of strings/numbers */
export type QueryKey = string | (string | number)[];

/** Arguments passed to fetcher functions */
export type FetcherArgs = { signal?: AbortSignal };

/** Function that fetches data, can be async or sync */
export type Fetcher<T = any> = (args?: FetcherArgs) => Promise<T> | T;

/** Function that compares two values for equality */
export type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

/** Infers the resolved return type of a fetcher function */
export type InferFetcherResult<F> =
  F extends (...args: any[]) => Promise<infer R> ? R :
  F extends (...args: any[]) => infer R ? R :
  any;

/**
 * Options for registering a fetcher function
 */
export type RegisterFetcherOptions<F extends Fetcher = Fetcher> = {
  fetcher: F;
  equalityFn?: EqualityFn<ReturnType<F> extends Promise<infer R> ? R : ReturnType<F>>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  placeholderData?: ReturnType<F> extends Promise<infer R> ? R : ReturnType<F>;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};

/**
 * Options for manual fetch operations
 */
export type FetchQueryOptions<T = any> = {
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  staleTime?: number;
  cacheTime?: number;
  signal?: AbortSignal;
};

/**
 * Options for setting query data manually
 */
export type SetQueryDataOptions<T = any> = { data: T };

/**
 * Comprehensive options for all read operations (getQueryData, getQueryState, subscribeQuery)
 */
export type ReadQueryOptions<T = any> = {
  enabled?: boolean;
  refetchOnSubscribe?: "always" | "stale" | false;
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  staleTime?: number;
  cacheTime?: number;
  signal?: AbortSignal;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};

/** Alias for ReadQueryOptions used in getQueryState */
export type GetQueryStateOptions<T = any> = ReadQueryOptions<T>;

/** Options for canceling fetch operations */
export type CancelOptions = {};

/**
 * Public query state returned by getQueryState
 */
export type QueryState<T = any> = {
  data?: T;
  error?: any;
  status: "idle" | "fetching" | "success" | "error";
  updatedAt: number | null;
  isStale: boolean;
  isPlaceholderData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
};
