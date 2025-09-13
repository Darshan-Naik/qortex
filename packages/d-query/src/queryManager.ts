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
  HandleMountOptions,
} from "./types";
import { serializeKey, shallowEqual, createDefaultState } from "./utils";

type Status = "idle" | "fetching" | "success" | "error";

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
};

export class QueryManager {
  private cache = new Map<string, QueryStateInternal<any>>();
  private fetcherRegistry = new Map<string, Fetcher<any>>();
  private subs = new Map<string, Set<() => void>>();

  private ensure<T = unknown>(key: QueryKey): QueryStateInternal<T> {
    const sk = serializeKey(key);
    if (!this.cache.has(sk)) {
      const fetcherRef = (this.fetcherRegistry.get(sk) as Fetcher<T>) ?? null;
      this.cache.set(sk, createDefaultState<T>(fetcherRef));
    }
    return this.cache.get(sk)! as QueryStateInternal<T>;
  }

  private emit(key: QueryKey) {
    const set = this.subs.get(serializeKey(key));
    if (!set) return;
    for (const cb of Array.from(set)) cb();
  }

  private scheduleEvictionIfNeeded(key: QueryKey) {
    const s = this.ensure(key);
    if (s.timeoutHandle) { clearTimeout(s.timeoutHandle); s.timeoutHandle = undefined; }
    if (s.subscribers === 0) {
      const sk = serializeKey(key);
      s.timeoutHandle = setTimeout(() => {
        if (s.subscribers === 0) { this.cache.delete(sk); this.subs.delete(sk); }
      }, s.cacheTime);
    }
  }

  registerFetcher<F extends Fetcher = Fetcher>(key: QueryKey, opts: RegisterFetcherOptions<F>): void {
    const sk = serializeKey(key);
    this.fetcherRegistry.set(sk, opts.fetcher as Fetcher<any>);
    const q = this.cache.get(sk) as QueryStateInternal<any> | undefined;
    if (q) {
      q.fetcher = opts.fetcher as Fetcher<any>;
      q.equalityFn = (opts.equalityFn as EqualityFn<any> | undefined) ?? q.equalityFn;
      q.staleTime = opts.staleTime ?? q.staleTime;
      q.cacheTime = opts.cacheTime ?? q.cacheTime;
      q.placeholderData = (opts.placeholderData as any) ?? q.placeholderData;
      q.usePreviousDataOnError = opts.usePreviousDataOnError ?? q.usePreviousDataOnError;
      q.usePlaceholderOnError = opts.usePlaceholderOnError ?? q.usePlaceholderOnError;
    } else {
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
    // Invoke fetch immediately only if enabled is not explicitly false
    if (opts.enabled !== false) {
      try { void this.fetchQuery<any>(key); } catch { /* noop */ }
    }
  }

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
      else { const onAbort = () => controller.abort(); ext.addEventListener("abort", onAbort, { once: true }); }
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
          // Equal result: update timestamp to maintain accurate staleness, but don't emit
          s.updatedAt = Date.now();
          s.status = "success";
          s.error = undefined;
        }
        s.fetchPromise = null;
        s.fetchController = null;
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
    this.emit(key);
  }

  getQueryData<T = unknown>(key: QueryKey, _opts?: {}): T | undefined {
    const s = this.ensure<T>(key);
    return s.data as T | undefined;
  }

  getQueryState<T = unknown>(key: QueryKey, _opts?: GetQueryStateOptions<T>): QueryState<T> {
    const s = this.ensure<T>(key);
    const now = Date.now();
    const isStale = s.updatedAt == null || (now - (s.updatedAt || 0) > s.staleTime) || s.isInvalidated;

    let returnedData: T | undefined = s.data as T | undefined;
    let isPlaceholderData = false;

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
    } else if (s.status === "fetching") {
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
    } else {
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
    } ;
  }

  invalidateQuery(key: QueryKey, _opts?: {}): void {
    const s = this.ensure(key);
    s.isInvalidated = true;
    this.emit(key);
  }

  cancelFetch(key: QueryKey, _opts?: CancelOptions): void {
    const s = this.ensure(key);
    if (s.fetchController) { try { s.fetchController.abort(); } catch { } s.fetchController = null; }
    s.fetchPromise = null;
  }

  subscribeQuery(key: QueryKey, cb: () => void): () => void {
    const sk = serializeKey(key);
    if (!this.subs.has(sk)) this.subs.set(sk, new Set());
    this.subs.get(sk)!.add(cb);
    return () => this.subs.get(sk)!.delete(cb);
  }

  onSubscribe(key: QueryKey): void {
    const s = this.ensure(key);
    s.subscribers++;
    if (s.timeoutHandle) { clearTimeout(s.timeoutHandle); s.timeoutHandle = undefined; }
  }

  onUnsubscribe(key: QueryKey): void {
    const s = this.ensure(key);
    s.subscribers = Math.max(0, s.subscribers - 1);
    this.scheduleEvictionIfNeeded(key);
  }

  async handleMount<T = unknown>(
    key: QueryKey,
    opts?: HandleMountOptions<T>
  ): Promise<T | undefined> {
    const s = this.ensure<T>(key);
    s.staleTime = opts?.staleTime ?? s.staleTime;
    s.fetcher = opts?.fetcher ?? s.fetcher;
    s.equalityFn = opts?.equalityFn ?? s.equalityFn;
    s.placeholderData = (opts?.placeholderData as T | undefined) ?? s.placeholderData;
    s.usePreviousDataOnError = opts?.usePreviousDataOnError ?? s.usePreviousDataOnError;
    s.usePlaceholderOnError = opts?.usePlaceholderOnError ?? s.usePlaceholderOnError;
    const enabled = opts?.enabled ?? true;

    if (!enabled) return Promise.resolve(s.data as T | undefined);

    const now = Date.now();
    const isStale = s.updatedAt == null || (now - (s.updatedAt || 0) > s.staleTime) || s.isInvalidated;

    if (opts?.refetchOnSubscribe === "always") {
      return this.fetchQuery<T>(key, { fetcher: opts?.fetcher, staleTime: s.staleTime, cacheTime: s.cacheTime, signal: opts?.signal });
    }
    if (opts?.refetchOnSubscribe === "stale") {
      if (isStale) {
        return this.fetchQuery<T>(key, { fetcher: opts?.fetcher, staleTime: s.staleTime, cacheTime: s.cacheTime, signal: opts?.signal }).catch(() => undefined);
      }
    }
    return Promise.resolve(s.data as T | undefined);
  }
}

export const queryManager = new QueryManager();
