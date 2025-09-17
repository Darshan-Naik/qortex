import type { QueryStatus, Fetcher, EqualityFn } from "./types";

/**
 * Internal query state that tracks all aspects of a query's lifecycle
 * Used internally by QueryManager for state management
 * NOT EXPORTED - internal implementation detail
 */
export type QueryStateInternal<T = any> = {
  data?: T;
  error?: unknown;
  status: QueryStatus;
  updatedAt?: number;
  staleTime: number;
  isInvalidated: boolean;
  fetcher?: Fetcher<T> | null;
  equalityFn: EqualityFn<T>;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
  refetchOnSubscribe: "always" | "stale" | false;
  enabled: boolean;
  lastFetchTime?: number;
  fetchPromise?: Promise<T>;
  refetch?: () => Promise<T>;
  isSuccess: boolean;
  isError: boolean;
};
