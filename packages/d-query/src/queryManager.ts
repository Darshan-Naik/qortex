import { THROTTLE_TIME } from "./constants";
import {
  QueryKey,
  Fetcher,
  EqualityFn,
  QueryOptions,
  QueryState,
} from "./types";
import { serializeKey, createDefaultState } from "./utils";

type Status = "idle" | "fetching" | "success" | "error";

/**
 * Internal query state that tracks all aspects of a query's lifecycle
 */
type QueryStateInternal<T = any> = {
  data?: T;
  error?: unknown;
  status: Status;
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
};

/**
 * Core query manager that handles caching, fetching, and state management
 * Implements robust throttling and race condition prevention
 */
export class QueryManager {
  private cache = new Map<string, QueryStateInternal>();
  private subs = new Map<string, Set<() => void>>();

  /**
   * Ensures a query state exists in cache, creating it if necessary
   */
  private ensureState(key: QueryKey, opts: QueryOptions<any> = {}) {
    const sk = serializeKey(key);
    const state = this.cache.get(sk);
    if (state) {
      Object.assign(state, opts);
      state.enabled = opts.enabled === false ? false : true;
      this.cache.set(sk, state);
    } else {
      this.cache.set(sk, createDefaultState(opts));
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
 */
  registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<Fetcher<T>>): void {
    this.ensureState(key, opts);
    // Auto-fetch if enabled
    if (opts.enabled !== false) {
      try { void this.fetchQuery<any>(key); } catch { }
    }
  }

  /**
 * Executes a fetch operation with proper error handling and state management
 * Prevents duplicate fetches
 */
  fetchQuery<T = any>(key: QueryKey, opts?: QueryOptions<Fetcher<T>>) {
    const state = this.ensureState(key, opts);
    if (state.fetchPromise) return state.fetchPromise as Promise<T>;

    const fetcher = state.fetcher;
    if (!fetcher) return Promise.resolve(state.data);
    state.status = "fetching";
    state.lastFetchTime = Date.now();
    this.emit(key, state);

    const promise = fetcher();
    state.fetchPromise = promise;
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

    })
    return promise as Promise<T>
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
    // update the state with return type QueryState<T>
    Object.assign(state, {
      data: returnedData,
      error: state.error,
      status: state.status,
      updatedAt: state.updatedAt,
      isStale,
      isPlaceholderData,
      isLoading: state.status === "fetching" && !state.updatedAt,
      isFetching: state.status === "fetching",
      isError: state.status === "error",
      isSuccess: state.status === "success",
      refetch: () => this.fetchQuery(key),
    });


    return state as unknown as QueryState<T>;
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
    const isThrottled = state.lastFetchTime && (Date.now() - state.lastFetchTime) < THROTTLE_TIME;

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