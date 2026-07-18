import type { Plugin, PluginContext } from "../types";
import { registerFetcher, subscribeQuery, invalidateQuery } from "qortex-query";

/**
 * Options for the query plugin.
 */
export interface QueryPluginOptions {
    /** Query key for qortex-query registration */
    queryKey: string | readonly (string | number | boolean | null | undefined)[];
    /** Fetcher function for qortex-query */
    fetcher: () => Promise<any>;
    /** Whether to invalidate the query after successful mutation. Default: true */
    invalidateOnMutate?: boolean;
    /** Stale time forwarded to qortex-query */
    staleTime?: number;
    /** Whether the query is enabled. Default: true */
    enabled?: boolean;
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
export function queryPlugin<T = any>(options: QueryPluginOptions): Plugin<T> {
    const {
        queryKey,
        fetcher,
        invalidateOnMutate = true,
        staleTime,
        enabled = true,
    } = options;

    return {
        name: "query",

        onInit(ctx: PluginContext<T>) {
            // Set loading status
            ctx.setStatus("loading");

            // Register the fetcher with qortex-query
            registerFetcher(queryKey, {
                fetcher,
                staleTime,
                enabled,
            });

            // Subscribe to query state changes and pipe data to resource
            const unsubscribe = subscribeQuery(queryKey, (state: any) => {
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

        onAfterMutate(_result: any, _ctx: PluginContext<T>) {
            if (!invalidateOnMutate) return;
            invalidateQuery(queryKey);
        },
    };
}
