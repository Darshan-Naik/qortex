import type { Plugin, PluginContext } from "../types";
import { getQueryData, setQueryData } from "qortex-query";
import type { QueryKey, QueryOptions } from "qortex-query";

export interface OptimisticQueryClientAdapter {
    getQueryData<T = any>(key: QueryKey, opts?: QueryOptions<T>): T | undefined;
    setQueryData<T = any>(key: QueryKey, dataOrUpdater: T | ((prevData: T | undefined) => T)): void;
}

export interface OptimisticPluginOptions<T = any> {
    /** Query key to update optimistically in qortex-query. If omitted, only resource rollback is tracked. */
    queryKey?: QueryKey;
    /** Custom query client adapter. Defaults to the global qortex-query manager. */
    client?: OptimisticQueryClientAdapter;
    /** Build the optimistic query value from the resource draft and previous query data. */
    updateQueryData?: (draft: T, previous: T | undefined) => T;
    /** Store mutation result into query cache on success. Default: true when queryKey is provided. */
    updateQueryOnSuccess?: boolean | ((result: any, previous: T | undefined) => T);
}

const defaultQueryClient: OptimisticQueryClientAdapter = {
    getQueryData,
    setQueryData,
};

/**
 * Optimistic UI Plugin.
 *
 * Instantly applies draft mutations to the underlying query cache (via qortex-query)
 * to provide a snappy UI, and automatically rolls back if the mutation fails.
 *
 * @example
 * ```ts
 * import { optimisticPlugin } from 'qortex-resource/optimistic';
 *
 * createResource({
 *   plugins: [
 *     optimisticPlugin(),
 *     queryPlugin({ queryKey: 'user' }), // Required for optimistic to have effect on query
 *   ]
 * });
 * ```
 */
export function optimisticPlugin<T = any>(options: OptimisticPluginOptions<T> = {}): Plugin<T> {
    // We store the snapshot of data before mutation to rollback if needed.
    let rollbackData: T | undefined;
    let rollbackQueryData: T | undefined;
    let hadQueryData = false;
    const {
        queryKey,
        client = defaultQueryClient,
        updateQueryData = (draft) => draft,
        updateQueryOnSuccess = true,
    } = options;

    return {
        name: "optimistic",

        async onBeforeMutate(draft: T, ctx: PluginContext<T>) {
            rollbackData = ctx.getData();

            if (queryKey !== undefined) {
                rollbackQueryData = client.getQueryData<T>(queryKey, { enabled: false });
                hadQueryData = rollbackQueryData !== undefined;
                client.setQueryData<T>(queryKey, (previous) => updateQueryData(draft, previous));
            }
            
            return true; // allow mutation
        },

        onAfterMutate(result: any, _ctx: PluginContext<T>) {
            if (queryKey !== undefined && result !== undefined && updateQueryOnSuccess) {
                if (typeof updateQueryOnSuccess === "function") {
                    client.setQueryData<T>(queryKey, (previous) => updateQueryOnSuccess(result, previous));
                } else {
                    client.setQueryData<T>(queryKey, result);
                }
            }
            rollbackData = undefined;
            rollbackQueryData = undefined;
            hadQueryData = false;
        },

        onMutateError(_error: unknown, ctx: PluginContext<T>) {
            if (queryKey !== undefined && hadQueryData) {
                client.setQueryData<T>(queryKey, rollbackQueryData as T);
            }

            if (rollbackData !== undefined) {
                ctx.setInitialData(rollbackData);
                ctx.resetDrafts();
            }

            rollbackData = undefined;
            rollbackQueryData = undefined;
            hadQueryData = false;
        },
    };
}
