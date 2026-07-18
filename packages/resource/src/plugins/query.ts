import type { Plugin, PluginContext } from "../types";
import {
    registerFetcher,
    subscribeQuery,
    invalidateQuery,
    setQueryData,
    getQueryData,
} from "qortex-query";
import type { QueryKey, QueryOptions, QueryState } from "qortex-query";

export interface QueryClientAdapter {
    registerFetcher<T = any>(key: QueryKey, opts: QueryOptions<T>): void;
    subscribeQuery<T = any>(
        key: QueryKey,
        cb: (state: QueryState<T>) => void,
        opts?: QueryOptions<T>,
    ): () => void;
    invalidateQuery(key: QueryKey): void;
    setQueryData<T = any>(key: QueryKey, dataOrUpdater: T | ((prevData: T | undefined) => T)): void;
    getQueryData<T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined;
}

const defaultQueryClient: QueryClientAdapter = {
    registerFetcher,
    subscribeQuery,
    invalidateQuery,
    setQueryData,
    getQueryData,
};

/**
 * Options for the query plugin.
 */
export interface QueryPluginOptions<T = any> {
    /** Query key for qortex-query registration */
    queryKey: QueryKey;
    /** Fetcher function for qortex-query */
    fetcher: () => Promise<T>;
    /** Whether to invalidate the query after successful mutation. Default: true */
    invalidateOnMutate?: boolean;
    /** Write mutation results into the query cache before invalidation. Default: true */
    updateCacheOnMutate?: boolean | ((result: any, previous: T | undefined) => T);
    /** Stale time forwarded to qortex-query */
    staleTime?: number;
    /** Whether the query is enabled. Default: true */
    enabled?: boolean;
    /** Whether qortex-query should persist this query when a persister is configured. Default: true */
    persist?: boolean;
    /** Query client adapter. Defaults to the global qortex-query manager. */
    client?: QueryClientAdapter;
}

/**
 * Query plugin — bridges `qortex-resource` with `qortex-query`.
 *
 * When initialized, it registers a fetcher with qortex-query, subscribes to
 * query state changes, and pipes server data into the resource.
 * On successful mutation, it optionally invalidates the query to refetch.
 *
 * **Requires `qortex-query` to be installed.** 
 *
 * @param options - Query plugin configuration
 * @returns A Plugin instance
 *
 * @example
 * ```ts
 * import { queryPlugin } from 'qortex-resource/query';
 *
 * createResource({
 *   fields: { name: { editable: true } },
 *   plugins: [
 *     queryPlugin({
 *       queryKey: ['user', userId],
 *       fetcher: () => api.getUser(userId),
 *       invalidateOnMutate: true,
 *     }),
 *   ],
 * });
 * ```
 */
export function queryPlugin<T = any>(options: QueryPluginOptions<T>): Plugin<T> {
    const {
        queryKey,
        fetcher,
        invalidateOnMutate = true,
        updateCacheOnMutate = true,
        staleTime,
        enabled = true,
        persist,
        client = defaultQueryClient,
    } = options;

    return {
        name: "query",

        onInit(ctx: PluginContext<T>) {
            // Set loading status
            ctx.setStatus("loading");

            // Register the fetcher with qortex-query
            client.registerFetcher(queryKey, {
                fetcher,
                staleTime,
                enabled,
                persist,
            });

            // Subscribe to query state changes and pipe data to resource
            const unsubscribe = client.subscribeQuery<T>(queryKey, (state) => {
                if (state.data !== undefined) {
                    ctx.setInitialData(state.data);
                }
                if (state.status === "fetching") {
                    ctx.setStatus("loading");
                } else if (state.status === "error") {
                    ctx.setError(state.error);
                } else if (state.status === "success") {
                    ctx.setStatus("ready");
                }
            });

            // Return cleanup function
            return () => {
                unsubscribe();
            };
        },

        onAfterMutate(result: any, _ctx: PluginContext<T>) {
            if (updateCacheOnMutate && result !== undefined) {
                if (typeof updateCacheOnMutate === "function") {
                    client.setQueryData<T>(queryKey, (previous) => updateCacheOnMutate(result, previous));
                } else {
                    client.setQueryData<T>(queryKey, result);
                }
            }
            if (!invalidateOnMutate) return;
            client.invalidateQuery(queryKey);
        },
    };
}
