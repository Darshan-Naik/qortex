import { Fetcher, InferFetcherResult, QueryKey } from "dquery-core";

export type UseQueryOptions<F extends Fetcher | undefined = undefined> = {
  fetcher?: F;
  equalityFn?: (a: InferFetcherResult<F> | undefined, b: InferFetcherResult<F> | undefined) => boolean;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnSubscribe?: "always" | "stale" | false;
  signal?: AbortSignal;
  placeholderData?: InferFetcherResult<F>;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
};

export type UseQueryResult<T = unknown> = {
  data?: T;
  error?: any;
  status: "idle" | "fetching" | "success" | "error";
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isStale: boolean;
  updatedAt: number | null;
  isPlaceholderData: boolean;
  refetch: () => Promise<T | undefined>;
  cancel: () => void;
};

export { QueryKey, Fetcher, InferFetcherResult } from "dquery-core";
