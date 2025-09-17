import { THROTTLE_TIME } from "./constants";
import {
  QueryKey,
  Fetcher,
  EqualityFn,
  QueryOptions,
  QueryState,
  QueryStatus,
  InferFetcherResult,
  DefaultConfig,
} from "./types";
import { serializeKey, createDefaultState, shallowEqual } from "./utils";

/**
 * Internal query state that tracks all aspects of a query's lifecycle
 * Improved with better type safety and generic constraints
 */
type QueryStateInternal<T = any> = {
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
};

/**
 * Core query manager that handles caching, fetching, and state management
 * Implements robust throttling and race condition prevention
 */
export class QueryManager {
  private cache = new Map<string, QueryStateInternal>();
  private subs = new Map<string, Set<() => void>>();
  private lastReturnedState = new Map<string, any>();
  private defaultConfig: DefaultConfig = {};
  private throttleTime: number = THROTTLE_TIME;

  /**
   * Set default configuration for all queries
   */
  setDefaultConfig({ throttleTime, ...config }: DefaultConfig): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };

    // Handle throttleTime separately since it's not part of QueryOptions
    if (throttleTime !== undefined) {
      this.throttleTime = throttleTime;
    }
  }

  /**
   * Ensures a query state exists in cache, creating it if necessary
   * User-friendly with any fallback for better developer experience
   */
  private ensureState<T = any>(key: QueryKey, opts: QueryOptions<T> = {}): QueryStateInternal<T> {
    const sk = serializeKey(key);
    const state = this.cache.get(sk);

    // Merge with default config 
    const mergedOpts = { ...this.defaultConfig, ...opts };

    if (state) {
      Object.assign(state, mergedOpts);
      state.enabled = mergedOpts.enabled === false ? false : true;
      this.cache.set(sk, state);
    } else {
      const newState = createDefaultState(mergedOpts, () => this.fetchQuery(key));
      this.cache.set(sk, newState);
    }
    return this.cache.get(sk)!;
  }

  /**
   * Notifies all subscribers of a query state change
   */
  private emit(key: QueryKey, state: QueryStateInternal) {
    this.cache.set(serializeKey(key), state);
    const set = this.subs.get(serializeKey(key));
    if (!set) return;
    for (const cb of Array.from(set)) cb();
  }


  /**
  * Registers a fetcher function for a query key
  * Automatically fetches if enabled is not false
  * Enhanced with automatic type inference from fetcher
  */
  registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<T>): void;
  registerFetcher<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): void;
  registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<T>): void {
    this.ensureState(key, opts);
    // Auto-fetch if enabled
    if (opts.enabled !== false) {
      try { void this.fetchQuery<any>(key); } catch { }
    }
  }

  /**
  * Executes a fetch operation with proper error handling and state management
  * Prevents duplicate fetches
  * Enhanced with automatic type inference from fetcher
  */
  fetchQuery<T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T>;
  fetchQuery<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): Promise<InferFetcherResult<F>>;
  fetchQuery<T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T> {
    const state = this.ensureState(key, opts);
    if (state.fetchPromise) return state.fetchPromise as Promise<T>;

    const fetcher = state.fetcher;
    if (!fetcher) {
      console.error("No fetcher found for key", key);
      return Promise.resolve(state.data as T);
    };
    state.status = "fetching";
    state.lastFetchTime = Date.now();
    this.emit(key, state);

    const result = fetcher();
    const promise = Promise.resolve(result);
    state.fetchPromise = promise;

    // Attach callbacks to the promise
    promise.then((result: T) => {
      state.data = result;
      state.status = "success";
      state.updatedAt = Date.now();
    }).catch((error: unknown) => {
      state.error = error;
      state.status = "error";
    }).finally(() => {
      state.fetchPromise = undefined;
      this.emit(key, state);
    });

    return promise;
  }

  /**
   * Manually sets query data without triggering a fetch
   * Marks query as successful
   */
  setQueryData<T = any>(key: QueryKey, data: T): void {
    const state = this.ensureState(key);
    const old = state.data;
    if (state.equalityFn(old, data)) return;
    state.data = data;
    state.updatedAt = Date.now();
    state.error = undefined;
    state.status = "success";
    state.isInvalidated = false;
    this.emit(key, state);
  }

  /**
   * Gets query data
   * Handles mount logic to potentially start fetching
   */
  getQueryData<T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);
    return state.data ?? state.placeholderData;
  }

  /**
   * Gets comprehensive query state including computed flags
   * Handles placeholder data and error states appropriately
   * Handles mount logic to potentially start fetching
   */
  getQueryState<T = unknown>(key: QueryKey, opts?: QueryOptions<T>): QueryState<T> {
    let state = this.ensureState(key, opts);
    const now = Date.now();
    const isStale = state.updatedAt == null || (now - (state.updatedAt || 0) > state.staleTime) || state.isInvalidated;

    let returnedData = state.data;
    let isPlaceholderData = false;
    const status = state.status;

    switch (status) {
      case "error":
        if (state.usePlaceholderOnError && state.placeholderData !== undefined) {
          returnedData = state.placeholderData;
          isPlaceholderData = true;
        }
        break;
      case "fetching":
        if (!state.data && state.placeholderData) {
          returnedData = state.placeholderData;
          isPlaceholderData = true;
        }
        break;
      case "success":
      case "idle":
        returnedData = state.data ?? state.placeholderData;
        isPlaceholderData = state.data ? false : Boolean(state.placeholderData);
        break;
    }
    this.handleMountLogic(key, state);

    // Check if we need to return a new object (only when state actually changes)
    const currentState = {
      data: returnedData,
      error: state.error,
      status: state.status,
      updatedAt: state.updatedAt,
      isStale,
      isPlaceholderData,
      isLoading: state.status === "fetching" && !state.updatedAt, // true only for first fetch
      isFetching: state.status === "fetching",
      isError: state.status === "error",
      isSuccess: state.status === "success",
      refetch: state.refetch,
    };

    // Store the last returned state to detect changes
    const stateKey = serializeKey(key);
    const lastState = this.lastReturnedState?.get(stateKey);

    // Only return a new object if the state has actually changed
    if (!lastState || !shallowEqual(lastState, currentState)) {
      // Store the new state
      if (!this.lastReturnedState) this.lastReturnedState = new Map();
      this.lastReturnedState.set(stateKey, currentState);

      return currentState as QueryState<T>;
    }

    // Return the same object reference if nothing changed
    return lastState as QueryState<T>;
  }

  /**
   * Marks a query as invalidated, triggering refetch
   */
  invalidateQuery(key: QueryKey): void {
    const state = this.ensureState(key);
    state.isInvalidated = true;
    this.emit(key, state);
    this.fetchQuery(key);
  }


  /**
   * Subscribes to query state changes with automatic subscription management
   * Handles mount logic to potentially start fetching
   */
  subscribeQuery<T = any>(key: QueryKey, cb: () => void, opts?: QueryOptions<T>): () => void {
    const sk = serializeKey(key);
    const state = this.ensureState(key, opts);

    // Set up subscription
    if (!this.subs.has(sk)) this.subs.set(sk, new Set());
    this.subs.get(sk)!.add(cb);
    this.handleMountLogic(key, state);

    // Return unsubscribe function that handles cleanup
    return () => {
      this.subs.get(sk)!.delete(cb);
    };
  }


  /**
   * Core mount logic that determines when to fetch
   * Implements robust throttling and race condition prevention
   */
  private handleMountLogic<T = any>(
    key: QueryKey,
    state: QueryStateInternal<T>
  ): void {
    const isThrottled = state.lastFetchTime && (Date.now() - state.lastFetchTime) < this.throttleTime;

    if (state?.status === "fetching" || !state?.enabled || isThrottled || !state?.fetcher) return;

    const now = Date.now();
    const isStale = state?.updatedAt == null || (now - (state.updatedAt || 0) > state.staleTime) || state.isInvalidated;

    let shouldRefetch = false;

    // Determine if we should fetch based on mount history and options    
    // Check refetchOnSubscribe setting
    if (state.refetchOnSubscribe === "always") {
      shouldRefetch = true;
    }
    if (state.refetchOnSubscribe === "stale") {
      shouldRefetch = isStale;
    }

    // Execute fetch if conditions are met
    if (shouldRefetch) {
      this.fetchQuery<T>(key)
    }
  }
}

export const queryManager = new QueryManager();