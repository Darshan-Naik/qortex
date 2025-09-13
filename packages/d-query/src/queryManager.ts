import {
  QueryKey,
  Fetcher,
  EqualityFn,
  RegisterFetcherOptions,
  FetchQueryOptions,
  SetQueryDataOptions,
  GetQueryStateOptions,
  CancelOptions,
  QueryState,
  ReadQueryOptions,
} from "./types";
import { serializeKey, shallowEqual, createDefaultState } from "./utils";

type Status = "idle" | "fetching" | "success" | "error";

/**
 * Internal query state that tracks all aspects of a query's lifecycle
 */
type QueryStateInternal<T = unknown> = {
  data?: T;
  error?: any;
  status: Status;
  updatedAt: number | null;
  fetchPromise?: Promise<T> | null;
  fetchController?: AbortController | null;
  subscribers: number;
  staleTime: number;
  cacheTime: number;
  timeoutHandle?: any;
  isInvalidated: boolean;
  fetcher?: Fetcher<T> | null;
  equalityFn?: EqualityFn<T> | undefined;
  placeholderData?: T;
  usePreviousDataOnError?: boolean;
  usePlaceholderOnError?: boolean;
  hasBeenMounted: boolean;
  lastMountTime: number | null;
  wasEnabledOnFirstMount: boolean;
  refetchOnSubscribe: "always" | "stale" | false;
  lastFetchTime: number | null;
};

/**
 * Core query manager that handles caching, fetching, and state management
 * Implements robust throttling and race condition prevention
 */
export class QueryManager {
  private cache = new Map<string, QueryStateInternal<any>>();
  private fetcherRegistry = new Map<string, Fetcher<any>>();
  private subs = new Map<string, Set<() => void>>();

  /**
   * Ensures a query state exists in cache, creating it if necessary
   */
  private ensure<T = unknown>(key: QueryKey): QueryStateInternal<T> {
    const sk = serializeKey(key);
    if (!this.cache.has(sk)) {
      const fetcherRef = (this.fetcherRegistry.get(sk) as Fetcher<T>) ?? null;
      this.cache.set(sk, createDefaultState<T>(fetcherRef));
    }
    return this.cache.get(sk)! as QueryStateInternal<T>;
  }

  /**
   * Notifies all subscribers of a query state change
   */
  private emit(key: QueryKey) {
    const set = this.subs.get(serializeKey(key));
    if (!set) return;
    for (const cb of Array.from(set)) cb();
  }

  /**
   * Schedules cache eviction for inactive queries
   */
  private scheduleEvictionIfNeeded(key: QueryKey) {
    const s = this.ensure(key);
    if (s.timeoutHandle) { 
      clearTimeout(s.timeoutHandle); 
      s.timeoutHandle = undefined; 
    }
    if (s.subscribers === 0) {
      const sk = serializeKey(key);
      s.timeoutHandle = setTimeout(() => {
        if (s.subscribers === 0) { 
          this.cache.delete(sk); 
          this.subs.delete(sk); 
        }
      }, s.cacheTime);
    }
  }

  /**
   * Registers a fetcher function for a query key
   * Automatically fetches if enabled is not false
   */
  registerFetcher<F extends Fetcher = Fetcher>(key: QueryKey, opts: RegisterFetcherOptions<F>): void {
    const sk = serializeKey(key);
    this.fetcherRegistry.set(sk, opts.fetcher as Fetcher<any>);
    const q = this.cache.get(sk) as QueryStateInternal<any> | undefined;
    
    if (q) {
      // Update existing query state
      q.fetcher = opts.fetcher as Fetcher<any>;
      q.equalityFn = (opts.equalityFn as EqualityFn<any> | undefined) ?? q.equalityFn;
      q.staleTime = opts.staleTime ?? q.staleTime;
      q.cacheTime = opts.cacheTime ?? q.cacheTime;
      q.placeholderData = (opts.placeholderData as any) ?? q.placeholderData;
      q.usePreviousDataOnError = opts.usePreviousDataOnError ?? q.usePreviousDataOnError;
      q.usePlaceholderOnError = opts.usePlaceholderOnError ?? q.usePlaceholderOnError;
    } else {
      // Create new query state
      const base = createDefaultState<any>(opts.fetcher as Fetcher<any>);
      this.cache.set(sk, {
        ...base,
        staleTime: opts.staleTime ?? base.staleTime,
        cacheTime: opts.cacheTime ?? base.cacheTime,
        equalityFn: opts.equalityFn as EqualityFn<any> | undefined,
        placeholderData: (opts.placeholderData as any) ?? base.placeholderData,
        usePreviousDataOnError: opts.usePreviousDataOnError ?? base.usePreviousDataOnError,
        usePlaceholderOnError: opts.usePlaceholderOnError ?? base.usePlaceholderOnError,
      });
    }
    
    // Auto-fetch if enabled
    if (opts.enabled !== false) {
      try { void this.fetchQuery<any>(key); } catch { }
    }
  }

  /**
   * Executes a fetch operation with proper error handling and state management
   * Prevents duplicate fetches and handles cancellation
   */
  async fetchQuery<T = unknown>(key: QueryKey, opts?: FetchQueryOptions<T>): Promise<T> {
    const s = this.ensure<T>(key);
    s.staleTime = opts?.staleTime ?? s.staleTime;
    s.cacheTime = opts?.cacheTime ?? s.cacheTime;
    s.equalityFn = opts?.equalityFn ?? s.equalityFn;

    const fetcher = opts?.fetcher ?? s.fetcher ?? (this.fetcherRegistry.get(serializeKey(key)) as Fetcher<T> | undefined);
    if (!fetcher) return Promise.reject(new Error(`No fetcher registered for key "${key}"`));
    if (s.fetchPromise) return s.fetchPromise as Promise<T>;

    const controller = new AbortController();
    if (opts?.signal) {
      const ext = opts.signal;
      if (ext.aborted) controller.abort();
      else { 
        const onAbort = () => controller.abort(); 
        ext.addEventListener("abort", onAbort, { once: true }); 
      }
    }

    s.fetchController = controller;
    s.status = "fetching";
    this.emit(key);

    const p = (async () => {
      try {
        const result = await fetcher({ signal: controller.signal });
        const eq = (s.equalityFn ?? shallowEqual) as EqualityFn<T>;
        const old = s.data as T | undefined;
        
        if (!eq(old, result)) {
          s.data = result;
          s.updatedAt = Date.now();
          s.error = undefined;
          s.status = "success";
          s.isInvalidated = false;
          this.emit(key);
        } else {
          s.updatedAt = Date.now();
          s.status = "success";
          s.error = undefined;
        }
        
        s.fetchPromise = null;
        s.fetchController = null;
        this.emit(key);
        this.scheduleEvictionIfNeeded(key);
        return s.data as T;
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
          s.fetchPromise = null;
          s.fetchController = null;
          s.status = "idle";
          this.emit(key);
          throw err;
        } else {
          s.error = err;
          s.status = "error";
          s.fetchPromise = null;
          s.fetchController = null;
          this.emit(key);
          throw err;
        }
      }
    })();

    s.fetchPromise = p;
    return p;
  }

  /**
   * Manually sets query data without triggering a fetch
   * Marks query as mounted to prevent unnecessary subsequent fetches
   */
  setQueryData<T = unknown>(key: QueryKey, opts: SetQueryDataOptions<T>): void {
    const s = this.ensure<T>(key);
    const eq = (s.equalityFn ?? shallowEqual) as EqualityFn<T>;
    const old = s.data as T | undefined;
    if (eq(old, opts.data)) return;
    
    s.data = opts.data;
    s.updatedAt = Date.now();
    s.error = undefined;
    s.status = "success";
    s.isInvalidated = false;
    s.hasBeenMounted = true;
    s.wasEnabledOnFirstMount = true;
    this.emit(key);
  }

  /**
   * Gets query data and triggers fetch logic if needed
   */
  getQueryData<T = unknown>(key: QueryKey, opts?: ReadQueryOptions<T>): T | undefined {
    const s = this.ensure<T>(key);
    this.updateQueryState(key, opts);
    this.handleMountLogic(key, opts);
    return s.data as T | undefined;
  }

  /**
   * Gets comprehensive query state including computed flags
   * Handles placeholder data and error states appropriately
   */
  getQueryState<T = unknown>(key: QueryKey, opts?: ReadQueryOptions<T>): QueryState<T> {
    const s = this.ensure<T>(key);
    this.updateQueryState(key, opts);
    this.handleMountLogic(key, opts);
    const now = Date.now();
    const isStale = s.updatedAt == null || (now - (s.updatedAt || 0) > s.staleTime) || s.isInvalidated;

    let returnedData: T | undefined = s.data as T | undefined;
    let isPlaceholderData = false;

    // Handle error state with fallback options
    if (s.status === "error") {
      if (s.usePreviousDataOnError && s.data !== undefined) {
        returnedData = s.data as T | undefined;
        isPlaceholderData = false;
      } else if (s.usePlaceholderOnError && s.placeholderData !== undefined) {
        returnedData = s.placeholderData as T;
        isPlaceholderData = true;
      } else {
        returnedData = undefined;
        isPlaceholderData = false;
      }
    } 
    // Handle fetching state with placeholder data
    else if (s.status === "fetching") {
      if (s.data === undefined) {
        const ph = s.placeholderData;
        if (ph !== undefined) {
          returnedData = ph as T;
          isPlaceholderData = true;
        } else {
          returnedData = s.data as T | undefined;
          isPlaceholderData = false;
        }
      } else {
        returnedData = s.data as T | undefined;
        isPlaceholderData = false;
      }
    } 
    // Handle success/idle state
    else {
      if (s.data === undefined) {
        const ph = s.placeholderData;
        if (ph !== undefined) {
          returnedData = ph as T;
          isPlaceholderData = true;
        } else {
          returnedData = s.data as T | undefined;
          isPlaceholderData = false;
        }
      } else {
        returnedData = s.data as T | undefined;
        isPlaceholderData = false;
      }
    }

    return {
      data: returnedData,
      error: s.error,
      status: s.status,
      updatedAt: s.updatedAt,
      isStale,
      isPlaceholderData,
      isLoading: (s.status === "idle" && returnedData === undefined),
      isFetching: s.status === "fetching",
      isError: s.status === "error",
      isSuccess: s.status === "success" && returnedData !== undefined,
    };
  }

  /**
   * Marks a query as invalidated, triggering refetch on next access
   */
  invalidateQuery(key: QueryKey, _opts?: {}): void {
    const s = this.ensure(key);
    s.isInvalidated = true;
    this.emit(key);
  }

  /**
   * Cancels an ongoing fetch operation
   */
  cancelFetch(key: QueryKey, _opts?: CancelOptions): void {
    const s = this.ensure(key);
    if (s.fetchController) { 
      try { s.fetchController.abort(); } catch { } 
      s.fetchController = null; 
    }
    s.fetchPromise = null;
  }

  /**
   * Subscribes to query state changes with automatic subscription management
   * Handles subscriber counting and triggers mount logic to potentially start fetching
   */
  subscribeQuery(key: QueryKey, cb: () => void, opts?: ReadQueryOptions<any>): () => void {
    const sk = serializeKey(key);
    const s = this.ensure(key);
    
    // Increment subscriber count and cancel eviction
    s.subscribers++;
    if (s.timeoutHandle) { 
      clearTimeout(s.timeoutHandle); 
      s.timeoutHandle = undefined; 
    }
    
    // Set up subscription
    if (!this.subs.has(sk)) this.subs.set(sk, new Set());
    this.subs.get(sk)!.add(cb);
    this.updateQueryState(key, opts);
    this.handleMountLogic(key, opts);
    
    // Return unsubscribe function that handles cleanup
    return () => {
      this.subs.get(sk)!.delete(cb);
      s.subscribers = Math.max(0, s.subscribers - 1);
      this.scheduleEvictionIfNeeded(key);
    };
  }

  /**
   * Updates query state with new options
   */
  private updateQueryState<T = unknown>(
    key: QueryKey,
    opts?: ReadQueryOptions<T>
  ): void {
    const s = this.ensure<T>(key);
    if (opts?.staleTime !== undefined) s.staleTime = opts.staleTime;
    if (opts?.cacheTime !== undefined) s.cacheTime = opts.cacheTime;
    if (opts?.fetcher !== undefined) s.fetcher = opts.fetcher;
    if (opts?.equalityFn !== undefined) s.equalityFn = opts.equalityFn;
    if (opts?.placeholderData !== undefined) s.placeholderData = opts.placeholderData;
    if (opts?.usePreviousDataOnError !== undefined) s.usePreviousDataOnError = opts.usePreviousDataOnError;
    if (opts?.usePlaceholderOnError !== undefined) s.usePlaceholderOnError = opts.usePlaceholderOnError;
    if (opts?.refetchOnSubscribe !== undefined) s.refetchOnSubscribe = opts.refetchOnSubscribe;
  }

  /**
   * Core mount logic that determines when to fetch
   * Implements robust throttling and race condition prevention
   * 
   * Fetch conditions:
   * 1. First mount with enabled=true
   * 2. Subsequent mount where first was disabled, now enabled
   * 3. Subsequent mount based on refetchOnSubscribe setting
   * 
   * Throttling:
   * - Prevents multiple fetches within 50ms window
   * - Blocks fetches if already in progress
   * - Sets status immediately to prevent race conditions
   */
  private handleMountLogic<T = unknown>(
    key: QueryKey,
    opts?: ReadQueryOptions<T>
  ): void {
    const s = this.ensure<T>(key);
    const enabled = opts?.enabled ?? true;
    const now = Date.now();
    
    // Early returns for disabled or already fetching queries
    if (!enabled) return;
    if (s.status === "fetching" || s.fetchPromise) return;
    if (s.lastFetchTime && (now - s.lastFetchTime) < 50) return;
    
    const isStale = s.updatedAt == null || (now - (s.updatedAt || 0) > s.staleTime) || s.isInvalidated;
    const isFirstMount = !s.hasBeenMounted;

    // Update mount tracking
    if (isFirstMount) {
      s.hasBeenMounted = true;
      s.wasEnabledOnFirstMount = enabled;
    }
    s.lastMountTime = now;

    let shouldRefetch = false;

    // Determine if we should fetch based on mount history and options
    if (isFirstMount) {
      shouldRefetch = true;
    } else {
      if (!s.wasEnabledOnFirstMount) {
        // First mount was disabled, this one is enabled - fetch
        shouldRefetch = true;
        s.wasEnabledOnFirstMount = true;
      } else {
        // Check refetchOnSubscribe setting
        const refetchOnSubscribe = opts?.refetchOnSubscribe ?? s.refetchOnSubscribe;
        if (refetchOnSubscribe === "always") {
          shouldRefetch = true;
        } else if (refetchOnSubscribe === "stale") {
          shouldRefetch = isStale;
        } else if (refetchOnSubscribe === false) {
          shouldRefetch = false;
        } else {
          // Default to "stale" behavior
          shouldRefetch = isStale;
        }
      }
    }

    // Execute fetch if conditions are met
    if (shouldRefetch) {
      s.status = "fetching";
      s.lastFetchTime = now;
      
      this.fetchQuery<T>(key, { 
        staleTime: s.staleTime, 
        cacheTime: s.cacheTime,
        signal: opts?.signal,
        fetcher: s.fetcher || undefined,
        equalityFn: s.equalityFn
      }).catch(() => undefined);
    }
  }

  /**
   * Mount method for React integration
   * @internal - Used by React hooks
   */
  mountQuery<T = unknown>(key: QueryKey, opts?: ReadQueryOptions<T>): void {
    this.updateQueryState(key, opts);
    this.handleMountLogic(key, opts);
  }
}

export const queryManager = new QueryManager();