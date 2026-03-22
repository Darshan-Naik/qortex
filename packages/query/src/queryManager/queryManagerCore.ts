import { THROTTLE_TIME } from "./constants";
import {
  QueryKey,
  Fetcher,
  QueryOptions,
  QueryState,
  InferFetcherResult,
  DefaultConfig,
  SetDataUpdater,
  Persister,
} from "./types";
import type { QueryStateInternal } from "./internal-types";
import {
  serializeKey,
  createDefaultState,
  equal,
  createPublicState,
  warnNoFetcherOrData,
  getEqualityFunction,
} from "./utils";

/**
 * Core query manager that handles caching, fetching, and state management
 * Implements robust throttling and race condition prevention
 *
 * All public methods are arrow functions to support destructuring:
 * @example
 * ```typescript
 * const { fetchQuery, getQueryData } = queryManager;
 * fetchQuery('key'); // Works correctly!
 * ```
 */
export class QueryManagerCore {
  private cache = new Map<string, QueryStateInternal>();
  private subs = new Map<string, Set<(state: QueryState) => void>>();
  private defaultConfig: DefaultConfig = {};
  private throttleTime: number = THROTTLE_TIME;
  private persister: Persister | null = null;
  private hasQueriesBeenUsed = false;

  /**
   * ⚠️ DANGER: Clear all cached data and subscriptions
   *
   * This method completely wipes all internal state including:
   * - All cached query data
   * - All active subscriptions
   * - All state references
   * - All persisted data
   *
   * @warning This should ONLY be used in testing environments or when you need to completely reset the query manager state. Using this in production will cause all active queries to lose their data and subscriptions to break.
   *
   * @example
   * ```typescript
   * // ✅ Safe usage in tests
   * beforeEach(() => {
   *   queryManager.dangerClearCache();
   * });
   *
   * // ❌ Dangerous usage in production
   * // queryManager.dangerClearCache(); // Don't do this!
   * ```
   */
  dangerClearCache = (): void => {
    this.cache.clear();
    this.subs.clear();
    this.persister?.clear();
  };

  /**
   * Sets default configuration that applies to all queries
   *
   * @param config - Default configuration object
   * @param config.enabled - Default enabled state for all queries. Default: `true`
   * @param config.staleTime - Default stale time in milliseconds. Default: `0` (data becomes stale immediately after fetch)
   * @param config.refetchOnSubscribe - Default refetch behavior on subscription. Default: `"stale"`
   * @param config.equalityStrategy - Default equality comparison strategy. Default: `"shallow"`
   * @param config.equalityFn - Default equality function. Default: `Object.is`
   * @param config.usePreviousDataOnError - Default behavior for previous data on error. Default: `false`
   * @param config.usePlaceholderOnError - Default behavior for placeholder data on error. Default: `false`
   * @param config.throttleTime - Time in ms to throttle fetch requests. Default: `100`
   * @param config.persister - Persister instance for data persistence
   *
   * These defaults will be merged with individual query options. Useful for setting global behavior
   * like default stale times, error handling, or persistence configuration.
   *
   * @example
   * ```typescript
   * queryManager.setDefaultConfig({
   *   staleTime: 5000,
   *   refetchOnSubscribe: 'stale',
   *   persister: createPersister('local', { burstKey: 'v1' })
   * });
   * ```
   */
  setDefaultConfig = ({
    throttleTime,
    persister,
    ...config
  }: DefaultConfig): void => {
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
  };

  /**
   * Ensures a query state exists in cache, creating it if necessary
   * User-friendly with any fallback for better developer experience
   */
  private ensureState<T = any>(
    key: QueryKey,
    opts: QueryOptions<T> = {}
  ): QueryStateInternal<T> {
    this.hasQueriesBeenUsed = true;
    const serializedKey = serializeKey(key);
    let state = this.cache.get(serializedKey);

    if (state) {
      // Build merged options based on whether state was loaded from persistence
      // Persisted config takes priority, then defaults, then new opts
      const mergedOpts = state.fromPersisterCache
        ? { ...state, ...this.defaultConfig, ...opts }
        : { ...this.defaultConfig, ...state, ...opts };
      Object.assign(state, mergedOpts, {
        enabled: mergedOpts.enabled !== false,
        persist: mergedOpts.persist !== false,
        fromPersisterCache: false,
      });
    } else {
      state = createDefaultState(serializedKey, { ...this.defaultConfig, ...opts }, () =>
        this.fetchQuery(key)
      );
      this.cache.set(serializedKey, state);
    }

    // Sync to persister (persister handles filtering non-persistable queries)
    this.persister?.sync(this.cache);
    return state;
  }

  /**
   * Notifies all subscribers of a query state change
   */
  private emit(key: QueryKey, state: QueryStateInternal) {
    const stateKey = serializeKey(key);
    this.cache.set(stateKey, state);

    // Sync to persister (persister handles filtering non-persistable queries)
    this.persister?.sync(this.cache);

    const set = this.subs.get(stateKey);
    if (!set) return;

    // Create public QueryState object for callbacks
    const publicState = createPublicState(state);

    // Push to microtask queue to avoid sync thread blocking
    queueMicrotask(() => {
      // Call all callbacks with the new state
      for (const cb of Array.from(set)) cb(publicState);
    });
  }

  /**
   * Registers a fetcher function for a query key and sets up the query state
   *
   * @param key - Unique identifier for the query (string or array of primitives)
   * @param opts - Query configuration options
   * @param opts.fetcher - Async function that fetches data for this query
   * @param opts.enabled - Whether the query should be active (default: true)
   * @param opts.staleTime - Time in ms before data is considered stale (default: 0)
   * @param opts.equalityStrategy - How to compare data for changes ('shallow' | 'deep')
   * @param opts.equalityFn - Custom equality function for data comparison
   * @param opts.refetchOnSubscribe - When to refetch on subscription ('always' | 'stale' | false)
   * @param opts.placeholderData - Initial data to show while loading
   * @param opts.usePreviousDataOnError - Keep previous data when error occurs
   * @param opts.usePlaceholderOnError - Use placeholder data when error occurs
   *
   * Automatically triggers initial fetch if enabled is not false.
   * Enhanced with automatic type inference from fetcher function.
   *
   * @example
   * ```typescript
   * queryManager.registerFetcher('users', {
   *   fetcher: async () => fetch('/api/users').then(r => r.json()),
   *   staleTime: 60000
   * });
   * ```
   */
  registerFetcher: {
    <T = any>(key: QueryKey, opts: QueryOptions<T>): void;
    <F extends Fetcher>(
      key: QueryKey,
      opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
    ): void;
  } = <T = any>(key: QueryKey, opts: QueryOptions<T>): void => {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);
  };

  /**
   * Executes a fetch operation with proper error handling and state management
   *
   * @param key - Unique identifier for the query
   * @param opts - Optional query configuration (if not already registered)
   * @returns Promise that resolves to the fetched data
   *
   * Prevents duplicate fetches by tracking ongoing promises.
   * Enhanced with automatic type inference from fetcher function.
   * Updates query state with loading, success, or error status.
   * Handles race conditions and concurrent requests.
   *
   * @example
   * ```typescript
   * const users = await queryManager.fetchQuery('users');
   * ```
   */
  fetchQuery: {
    <T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T>;
    <F extends Fetcher>(
      key: QueryKey,
      opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
    ): Promise<InferFetcherResult<F>>;
  } = <T = any>(key: QueryKey, opts?: QueryOptions<T>): Promise<T> => {
    const state = this.ensureState(key, opts);
    // Prevent duplicate fetches by returning existing promise
    if (state.fetchPromise) return state.fetchPromise as Promise<T>;

    const { fetcher } = state;
    if (!fetcher) {
      // No fetcher registered - return existing data or warn
      if (state.updatedAt === undefined) warnNoFetcherOrData(key);
      return Promise.resolve(state.data as T);
    }

    // Create promise and set it immediately to prevent race conditions
    const promise = fetcher();
    Object.assign(state, { fetchPromise: promise, status: "fetching" });
    this.emit(key, state);

    // Shared handler for success/error - atomic state updates
    const finalize = (isSuccess: boolean, result?: T, error?: unknown) => {
      const equalityFn = getEqualityFunction(state.equalityStrategy, state.equalityFn);
      Object.assign(state, {
        // Keep existing data if equal (prevents unnecessary re-renders)
        data: isSuccess && result !== undefined 
          ? (equalityFn(state.data, result) ? state.data : result) 
          : state.data, // Keep previous data on error (handled by createPublicState)
        error: isSuccess ? undefined : error,
        status: isSuccess ? "success" : "error",
        isError: !isSuccess,
        isSuccess,
        updatedAt: Date.now(),
        fetchPromise: undefined,
      });
      this.emit(key, state);
    };

    promise.then((result: T) => finalize(true, result)).catch((error) => finalize(false, undefined, error));
    return promise;
  };

  /**
   * Manually sets query data without triggering a fetch operation
   *
   * @param key - Unique identifier for the query
   * @param dataOrUpdater - Data to set, or an updater function that receives previous data
   *
   * Marks the query as successful and updates the cache.
   * Useful for optimistic updates or setting initial data.
   * Triggers all subscribers with the new data.
   * Does not affect the fetcher function or trigger network requests.
   *
   * @example
   * ```typescript
   * // Direct update
   * setQueryData('user', { id: 1, name: 'John' });
   *
   * // Functional update - access previous data
   * setQueryData('user', (prev) => ({ ...prev, name: 'Jane' }));
   *
   * // Increment counter example
   * setQueryData('counter', (prev) => (prev ?? 0) + 1);
   * ```
   */
  setQueryData = <T = any>(
    key: QueryKey,
    dataOrUpdater: T | SetDataUpdater<T>
  ): void => {
    const state = this.ensureState(key);
    const old = state.data as T | undefined;
    // Resolve the new data - either direct value or from updater function
    const newData = typeof dataOrUpdater === "function"
      ? (dataOrUpdater as SetDataUpdater<T>)(old)
      : dataOrUpdater;

    // Skip update if data hasn't changed (prevents unnecessary re-renders)
    const equalityFn = getEqualityFunction(state.equalityStrategy, state.equalityFn);
    if (equalityFn(old, newData)) return;

    // Atomic update: mark as successful with new data
    Object.assign(state, {
      data: newData,
      updatedAt: Date.now(),
      error: undefined,
      status: "success",
      isInvalidated: false,
      isError: false,
      isSuccess: true,
    });
    this.emit(key, state);
  };

  /**
   * Gets the current data for a query
   *
   * @param key - Unique identifier for the query
   * @param opts - Optional query configuration (if not already registered)
   * @returns The current data value or undefined if not available
   *
   * Handles mount logic to potentially start fetching if data is stale or missing.
   * Returns undefined if the query has never been fetched or if an error occurred.
   *
   * @example
   * ```typescript
   * const users = queryManager.getQueryData('users');
   * if (users) {
   *   console.log('Got cached users:', users);
   * }
   * ```
   */
  getQueryData: {
    <T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined;
    <F extends Fetcher>(
      key: QueryKey,
      opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
    ): InferFetcherResult<F> | undefined;
  } = <T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined => {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);
    return createPublicState(state).data;
  };

  /**
   * Gets the complete query state including loading, error, and computed flags
   *
   * @param key - Unique identifier for the query
   * @param opts - Optional query configuration (if not already registered)
   * @returns QueryState object with data, error, status, and computed flags
   *
   * Returns an object containing:
   * - data: The current data value
   * - error: Any error that occurred during fetching
   * - status: Current status ('idle' | 'fetching' | 'success' | 'error')
   * - isStale: Whether the data is considered stale
   * - isLoading: Whether the query is currently loading
   * - isFetching: Whether a fetch is in progress
   * - isError: Whether the query is in an error state
   * - isSuccess: Whether the query completed successfully
   * - refetch: Function to manually trigger a refetch
   *
   * Handles mount logic to potentially start fetching if data is stale or missing.
   *
   * @example
   * ```typescript
   * const { data, isLoading, error, refetch } = queryManager.getQueryState('users');
   * ```
   */
  getQueryState: {
    <T = unknown>(key: QueryKey, opts?: QueryOptions<T>): QueryState<T>;
    <F extends Fetcher>(
      key: QueryKey,
      opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
    ): QueryState<InferFetcherResult<F>>;
  } = <T = unknown>(key: QueryKey, opts?: QueryOptions<T>): QueryState<T> => {
    const state = this.ensureState(key, opts);
    this.handleMountLogic(key, state);

    // Create public state using the shared utility function
    const currentState = createPublicState(state);
    const { lastReturnedState } = state;

    // Return same object reference if unchanged (important for React useSyncExternalStore)
    // This prevents unnecessary re-renders when state hasn't actually changed
    if (lastReturnedState && equal(lastReturnedState, currentState, "shallow")) {
      return lastReturnedState as QueryState<T>;
    }
    state.lastReturnedState = currentState;
    return currentState;
  };

  /**
   * Finds all states that match the given key
   * @param key - Unique identifier for the query 
   * @returns An array of matching states
   */
  private findMatchingStates(key: QueryKey ): QueryStateInternal[] {
    const serializedKey = serializeKey(key);
    // return all states that start with the serialized key with "#" segmentation
    return [...this.cache.values()].filter((state) => state.key.startsWith(serializedKey + "#") || state.key === serializedKey);
  }

  /**
   * Invalidates a query, marking it as stale and triggering a refetch
   *
   * @param key - Unique identifier for the query or partial key
   *
   * Marks the query as invalidated and immediately triggers a refetch operation.
   * Useful for forcing data refresh after mutations or when you know data is outdated.
   * All subscribers will be notified of the state changes.
   *
   * @example
   * ```typescript
   * // After updating a user, invalidate the users list
   * await updateUser(userId, newData);
   * queryManager.invalidateQuery('users');
   * ```
   */
  invalidateQuery = (key: QueryKey): void => {
    const states = this.findMatchingStates(key);
    for (const state of states) {
      state.isInvalidated = true;
      this.emit(state.key, state);
      this.fetchQuery(state.key);
    }
  };

  /**
   * Subscribes to query state changes and returns an unsubscribe function
   *
   * @param key - Unique identifier for the query
   * @param cb - Function called whenever the query state changes
   * @param opts - Optional query configuration (if not already registered)
   * @returns Unsubscribe function to stop receiving updates
   *
   * The callback receives the current QueryState object.
   * Handles mount logic to potentially start fetching.
   * Returns a cleanup function that should be called when the subscription is no longer needed.
   * Multiple subscribers can be registered for the same query key.
   *
   * @example
   * ```typescript
   * const unsubscribe = queryManager.subscribeQuery('users', (state) => {
   *   console.log('Users state changed:', state);
   * });
   *
   * // Later, when done
   * unsubscribe();
   * ```
   */
  subscribeQuery: {
    (key: QueryKey, cb: (state: QueryState<any>) => void): () => void;
    <F extends Fetcher>(
      key: QueryKey,
      cb: (state: QueryState<InferFetcherResult<F>>) => void,
      opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F }
    ): () => void;
    <T = any>(
      key: QueryKey,
      cb: (state: QueryState<T>) => void,
      opts?: QueryOptions<T>
    ): () => void;
  } = <T = any>(
    key: QueryKey,
    cb: (state: QueryState<T>) => void,
    opts?: QueryOptions<T>
  ): (() => void) => {
    const serializedKey = serializeKey(key);
    const state = this.ensureState(key, opts);
    
    // Get or create subscription set for this key
    const subs = this.subs.get(serializedKey) ?? this.subs.set(serializedKey, new Set()).get(serializedKey)!;
    subs.add(cb);
    this.handleMountLogic(key, state);

    // Return unsubscribe function for cleanup
    return () => subs.delete(cb);
  };

  /**
   * Core mount logic that determines when to fetch
   * Implements robust throttling and race condition prevention
   */
  private async handleMountLogic<T = any>(
    key: QueryKey,
    state: QueryStateInternal<T>
  ): Promise<void> {
    // Early exits
    if (state.status === "fetching" || !state.enabled || !state.fetcher) return;

    // If a persister is configured, ensure hydration has finished before making any data/fetch decisions
    // This prevents double-fetching on page load when persisted data is already available
    if (this.persister?.hydrationPromise) {
      await this.persister.hydrationPromise;
    }

    // First fetch - always trigger if NO data was restored from persistence
    if (!state.updatedAt) {
      this.fetchQuery<T>(key);
      return;
    }

    const timeSinceUpdate = Date.now() - state.updatedAt;

    // Throttle check (only after first fetch)
    if (timeSinceUpdate < this.throttleTime) return;

    // Check refetchOnSubscribe setting
    const { refetchOnSubscribe } = state;
    if (refetchOnSubscribe === "always") {
      this.fetchQuery<T>(key);
    } else if (refetchOnSubscribe === "stale") {
      const isStale = timeSinceUpdate > state.staleTime || state.isInvalidated;
      if (isStale) this.fetchQuery<T>(key);
    }
  }
}
export default QueryManagerCore;
