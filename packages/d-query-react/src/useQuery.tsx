import { useSyncExternalStore, useMemo, useRef } from "react";
import { queryManager } from "dquery-core";
import { QueryKey, Fetcher, InferFetcherResult } from "dquery-core";
import { UseQueryOptions, UseQueryResult } from "./types";
import { subscribeToKey } from "./subscribe";
import { snapshotEqual, computeStatusFlags } from "./utils";


/**
 * useQuery hook (cached snapshot version)
 */
export function useQuery<F extends Fetcher | undefined = undefined, T = F extends Fetcher ? InferFetcherResult<F> : unknown>(
  key: QueryKey,
  opts?: UseQueryOptions<F>
): UseQueryResult<T> {
  const memoOpts = useMemo(() => opts ?? {}, [opts]);

  // Keep a ref to the last snapshot object so we can return same reference when unchanged
  const lastSnapshotRef = useRef<UseQueryResult<T> | null>(null);

  const subscribe = (notify: () => void) => {
    const unsub = subscribeToKey(key, notify);
    queryManager.handleMount<T>(key, {
      refetchOnSubscribe: memoOpts.refetchOnSubscribe ?? "stale",
      fetcher: memoOpts.fetcher as Fetcher<T> | undefined,
      staleTime: memoOpts.staleTime,
      enabled: memoOpts.enabled,
      equalityFn: memoOpts.equalityFn as any,
      signal: memoOpts.signal,
      // allow first-use to seed runtime defaults
      placeholderData: memoOpts.placeholderData as any,
      usePreviousDataOnError: (memoOpts as any).usePreviousDataOnError,
      usePlaceholderOnError: (memoOpts as any).usePlaceholderOnError,
    }).catch(() => { });
    return unsub;
  };

  const getSnapshot = (): UseQueryResult<T> => {
    const state = queryManager.getQueryState<T>(key, {});

    const { isLoading, isFetching, isError, isSuccess } = state;

    const refetch = async () => {
      try {
        const result = await queryManager.fetchQuery<T>(key, {
          fetcher: memoOpts.fetcher as Fetcher<T> | undefined,
          equalityFn: memoOpts.equalityFn as any,
          staleTime: memoOpts.staleTime,
          cacheTime: memoOpts.cacheTime,
          signal: memoOpts.signal,
        });
        return result;
      } catch {
        return undefined;
      }
    };

    const cancel = () => queryManager.cancelFetch(key);

    // create a fresh snapshot object
    const newSnap: UseQueryResult<T> = {
      data: state.data as T | undefined,
      error: state.error,
      status: state.status,
      isLoading,
      isFetching,
      isError,
      isSuccess,
      isStale: state.isStale,
      updatedAt: state.updatedAt,
      isPlaceholderData: state.isPlaceholderData,
      refetch,
      cancel,
    };

    const prev = lastSnapshotRef.current;
    if (snapshotEqual(prev, newSnap)) {
      // return the same reference as before to satisfy useSyncExternalStore expectations
      return prev as UseQueryResult<T>;
    } else {
      lastSnapshotRef.current = newSnap;
      return newSnap;
    }
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
