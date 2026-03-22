
/**
 * Query key can be a string or readonly array of strings/numbers
 * Using readonly to prevent accidental mutations
 */
type Key = string | number | boolean | null | undefined;
export type QueryKey = Key | readonly Key[];

/** Function that fetches data, must be async */
export type Fetcher<T = any> = () => Promise<T>;

/** Function that compares two values for equality */
export type EqualityFn<T = any> = (
  a: T | undefined,
  b: T | undefined
) => boolean;

/**
 * Updater function for setQueryData
 * Receives previous data and returns new data
 */
export type SetDataUpdater<T> = (prevData: T | undefined) => T;

/** Strategy for equality comparison */
export type EqualityStrategy = "shallow" | "deep";

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
  /** Whether to persist this query's data. Default: true */
  persist?: boolean;
};

/**
 * Interface for a persister that can save and load query state.
 *
 * Implement this interface to provide custom persistence logic.
 * The recommended implementation is `createQueryPersister` from `qortex-db`,
 * which supports localStorage, sessionStorage, and IndexedDB drivers.
 *
 * @example
 * ```ts
 * import { createDB, createQueryPersister } from "qortex-db";
 * import { setDefaultConfig } from "qortex-query";
 *
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 * setDefaultConfig({ persister: createQueryPersister(db, { burstKey: "v2" }) });
 * ```
 */
export interface Persister {
    /** Hydrate the in-memory query cache from storage. Called once on boot. */
    load(cache: Map<string, unknown>, hasQueriesBeenUsed: boolean): void;
    /** Debounce-write the current cache snapshot to storage. */
    sync(cache: Map<string, unknown>): void;
    /** Remove all persisted data from storage. */
    clear(): void;
    /** Optional promise that resolves when hydration is complete. */
    hydrationPromise?: Promise<void>;
}

/**
 * Default configuration options that can be set globally.
 * Includes throttleTime which is not part of regular QueryOptions.
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
