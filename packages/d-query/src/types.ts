/** Query key can be a string or array of strings/numbers */
export type QueryKey = string | (string | number)[];



/** Function that fetches data, can be async or sync */
export type Fetcher<T = any> = () => Promise<T> | T;

/** Function that compares two values for equality */
export type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

/** Infers the resolved return type of a fetcher function */
export type InferFetcherResult<F> =
  F extends (...args: any[]) => Promise<infer R> ? R :
  F extends (...args: any[]) => infer R ? R :
  any;

/**
 * Comprehensive options for all query operations
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
 */
export type QueryState<T = any> = {
  data?: T;
  error?: any;
  status: "idle" | "fetching" | "success" | "error";
  updatedAt?: number;
  isStale: boolean;
  isPlaceholderData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
};
