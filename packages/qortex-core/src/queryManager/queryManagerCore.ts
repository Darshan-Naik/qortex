import { THROTTLE_TIME } from "./constants";
import {
  QueryKey,
  Fetcher,
  QueryOptions,
  QueryState,
  InferFetcherResult,
  DefaultConfig,
} from "./types";
import type { QueryStateInternal } from "./internal-types";
import { serializeKey, createDefaultState, equal, createPublicState, warnNoFetcherOrData, getEqualityFunction } from "./utils";
import type { Persister } from "../persister";


/**
 * Core query manager that handles caching, fetching, and state management
 * Implements robust throttling and race condition prevention
 */
export class QueryManagerCore {
  private cache = new Map<string, QueryStateInternal>();
  private subs = new Map<string, Set<(state: QueryState) => void>>();
  private defaultConfig: DefaultConfig = {};
  private throttleTime: number = THROTTLE_TIME;
  private persister: Persister | null = null;
  private hasQueriesBeenUsed = false;

  dangerClearCache(): void {
    this.cache.clear();
    this.subs.clear();
    this.persister?.clear();
  }

  setDefaultConfig({ throttleTime, persister, ...config }: DefaultConfig): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };

    // Handle throttleTime separately since it's not part of QueryOptions
    if (throttleTime !== undefined) {
      this.throttleTime = throttleTime;
    }

    // Handle persister configuration
    if (persister) {
      this.persister = persister;

      // Hydrate cache from persister
      // Persister handles all hydration logic internally
      this.persister?.load(this.cache, this.hasQueriesBeenUsed);
    }

  }

  /**
   * Ensures a query state exists in cache, creating it if necessary
   * User-friendly with any fallback for better developer experience
   */
  private ensureState<T = any>(key: QueryKey, opts: QueryOptions<T> = {}): QueryStateInternal<T> {
    this.hasQueriesBeenUsed = true;
    const serializedKey = serializeKey(key);
    const state = this.cache.get(serializedKey);

    // Merge with default config 

    if (state) {
      const mergedOpts = { ...this.defaultConfig, ...state, ...opts };
      Object.assign(state, mergedOpts);
      state.enabled = mergedOpts.enabled === false ? false : true;
      this.cache.set(serializedKey, state);
    } else {
      const mergedOpts = { ...this.defaultConfig, ...opts };
      const newState = createDefaultState(mergedOpts, () => this.fetchQuery(key));
      this.cache.set(serializedKey, newState);
    }

    // Sync to persister 
    this.persister?.sync(this.cache);

    return this.cache.get(serializedKey)!;
  }

  /**
   * Notifies all subscribers of a query state change
   */
  private emit(key: QueryKey, state: QueryStateInternal) {
    const stateKey = serializeKey(key);
    this.cache.set(stateKey, state);

    // Sync to persister - persister handles all serialization internally
    this.persister?.sync(this.cache);

    const set = this.subs.get(stateKey);
    if (!set) return;

    // Create public QueryState object for callbacks
    const publicState = createPublicState(state);

    // Call all callbacks with the new state
    for (const cb of Array.from(set)) cb(publicState);
  }


  registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<T>): void;
  registerFetcher<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): void;
  registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<T>): void {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);
  }

  fetchQuery<T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T>;
  fetchQuery<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): Promise<InferFetcherResult<F>>;
  fetchQuery<T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T> {
    const state = this.ensureState(key, opts);
    if (state.fetchPromise) return state.fetchPromise as Promise<T>;

    const fetcher = state.fetcher;
    if (!fetcher) {
      // If no fetcher is registered, return existing data (if any)
      // This handles cases where data was set via setQueryData() without a fetcher
      if (state.updatedAt === undefined) {
        warnNoFetcherOrData(key);
      }
      return Promise.resolve(state.data as T);
    };

    // Create promise and set it immediately to prevent race conditions
    const promise = fetcher();
    state.fetchPromise = promise;
    state.status = "fetching";
    state.lastFetchTime = Date.now();
    this.emit(key, state);

    // Attach callbacks to the promise with atomic state updates
    promise.then((result: T) => {
      // Atomic update: set all success state properties together
      const equalityFn = getEqualityFunction(state.equalityStrategy, state.equalityFn);
      state.data = equalityFn(state.data, result) ? state.data : result;
      state.status = "success";
      state.isError = false;
      state.isSuccess = true;
      state.updatedAt = Date.now();
      state.fetchPromise = undefined;
      state.error = undefined;
      this.emit(key, state);
    }).catch((error: unknown) => {
      // Atomic update: set all error state properties together
      // not resetting data to undefined because we want to keep the previous data on error based on usePreviousDataOnError 
      // this is handled in createPublicState
      state.error = error;
      state.status = "error";
      state.isError = true;
      state.isSuccess = false;
      state.updatedAt = Date.now();
      state.fetchPromise = undefined;
      this.emit(key, state);
    });

    return promise;
  }

  setQueryData<T = any>(key: QueryKey, data: T): void {
    const state = this.ensureState(key);
    const old = state.data;
    const equalityFn = getEqualityFunction(state.equalityStrategy, state.equalityFn);
    if (equalityFn(old, data)) return;
    state.data = data;
    state.updatedAt = Date.now();
    state.error = undefined;
    state.status = "success";
    state.isInvalidated = false;
    state.isError = false;
    state.isSuccess = true;
    this.emit(key, state);
  }

  getQueryData<T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined;
  getQueryData<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): InferFetcherResult<F> | undefined;
  getQueryData<T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);
    return createPublicState(state).data;
  }

  getQueryState<T = unknown>(key: QueryKey, opts?: QueryOptions<T>): QueryState<T>;
  getQueryState<F extends Fetcher>(key: QueryKey, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): QueryState<InferFetcherResult<F>>;
  getQueryState<T = unknown>(key: QueryKey, opts?: QueryOptions<T>): QueryState<T> {
    let state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);

    // Create public state using the shared utility function
    const currentState = createPublicState(state);

    // Store the last returned state to detect changes
    const lastState = state.lastReturnedState;

    // Only return a new object if the state has actually changed
    if (!lastState || !equal(lastState, currentState, 'shallow')) {
      // Store the new state in the internal state
      state.lastReturnedState = currentState;
      return currentState;
    }

    // Return the same object reference if nothing changed
    return lastState as QueryState<T>;
  }

  invalidateQuery(key: QueryKey): void {
    const state = this.ensureState(key);
    state.isInvalidated = true;
    this.emit(key, state);
    this.fetchQuery(key);
  }


  subscribeQuery(key: QueryKey, cb: (state: QueryState<any>) => void): () => void;
  subscribeQuery<F extends Fetcher>(key: QueryKey, cb: (state: QueryState<InferFetcherResult<F>>) => void, opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }): () => void;
  subscribeQuery<T = any>(key: QueryKey, cb: (state: QueryState<T>) => void, opts?: QueryOptions<T>): () => void;
  subscribeQuery<T = any>(key: QueryKey, cb: (state: QueryState<T>) => void, opts?: QueryOptions<T>): () => void {
    const serializedKey = serializeKey(key);
    const state = this.ensureState(key, opts);

    // Set up subscription
    if (!this.subs.has(serializedKey)) this.subs.set(serializedKey, new Set());
    this.subs.get(serializedKey)!.add(cb);
    this.handleMountLogic(key, state);

    // Return unsubscribe function that handles cleanup
    return () => {
      this.subs.get(serializedKey)!.delete(cb);
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

    if (state.status === "fetching" || !state.enabled || isThrottled || !state.fetcher) return;

    const now = Date.now();
    // For mount logic, we need to fetch if:
    // 1. Never fetched (updatedAt is null), OR
    // 2. Time has crossed staleTime, OR  
    // 3. It's invalidated
    const isStale = state.updatedAt == null || (now - (state.updatedAt || 0) > state.staleTime) || state.isInvalidated;

    let shouldRefetch = false;

    // Always fetch on first mount (never fetched)
    if (state.updatedAt == null) {
      shouldRefetch = true;
    } else {
      // Determine if we should fetch based on mount history and options    
      // Check refetchOnSubscribe setting
      if (state.refetchOnSubscribe === "always") {
        shouldRefetch = true;
      }
      if (state.refetchOnSubscribe === "stale") {
        shouldRefetch = isStale;
      }
    }

    // Execute fetch if conditions are met
    if (shouldRefetch) {
      this.fetchQuery<T>(key)
    }
  }
}
export default QueryManagerCore;