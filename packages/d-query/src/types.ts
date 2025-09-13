export type QueryKey = string | (string | number)[];
export type FetcherArgs = { signal?: AbortSignal };
export type Fetcher<T = any> = (args?: FetcherArgs) => Promise<T> | T;
export type EqualityFn<T = any> = (a: T | undefined, b: T | undefined) => boolean;

/** Infer resolved return type of a fetcher */
export type InferFetcherResult<F> =
  F extends (...args: any[]) => Promise<infer R> ? R :
  F extends (...args: any[]) => infer R ? R :
  any;

// Public runtime option types
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

export type FetchQueryOptions<T = any> = {
  fetcher?: Fetcher<T>;
  equalityFn?: EqualityFn<T>;
  staleTime?: number;
  cacheTime?: number;
  signal?: AbortSignal;
};

export type SetQueryDataOptions<T = any> = { data: T };

export type GetQueryStateOptions<T = any> = {};

export type CancelOptions = {};

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

// Options passed from React lifecycle when a subscriber mounts
export type HandleMountOptions<T = any> = {
  refetchOnSubscribe?: "always" | "stale" | false;
  fetcher?: Fetcher<T>;
  staleTime?: number;
  enabled?: boolean;
  equalityFn?: EqualityFn<T>;
  signal?: AbortSignal;
  // bootstrap runtime-level defaults when first mounting via React
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};


