import type { QueryStatus, Fetcher, EqualityFn, EqualityStrategy, QueryState } from "./types";

/**
 * Internal query state that tracks all aspects of a query's lifecycle
 * Used internally by QueryManager for state management
 * NOT EXPORTED - internal implementation detail
 */
export type QueryStateInternal<T = any, E = unknown> = {
  key: string;
  data?: T;
  error?: E;
  status: QueryStatus;
  updatedAt?: number;
  staleTime: number;
  isInvalidated: boolean;
  fetcher?: Fetcher<T> | null;
  equalityFn?: EqualityFn<T>;
  equalityStrategy: EqualityStrategy;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
  refetchOnSubscribe: "always" | "stale" | false;
  enabled: boolean;
  fetchPromise?: Promise<T> | T;
  refetch?: () => Promise<T>;
  isSuccess: boolean;
  isError: boolean;
  lastReturnedState?: QueryState<T>;
  fromPersisterCache?: boolean; // Flag to indicate state was loaded from persistence
  persist: boolean; // Whether to persist this query's data (default: true)
};
