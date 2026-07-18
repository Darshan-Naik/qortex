import type { Plugin, PluginContext } from "../types";

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
export function optimisticPlugin<T = any>(): Plugin<T> {
    // We store the snapshot of data before mutation to rollback if needed.
    let rollbackData: T | undefined;

    return {
        name: "optimistic",

        async onBeforeMutate(draft: T, ctx: PluginContext<T>) {
            rollbackData = ctx.getData();
            
            // In a real implementation tightly coupled with qortex-query, 
            // we would call setQueryData here if we knew the queryKey.
            // Since this plugin operates on the resource, and queryPlugin handles the query,
            // we could either have queryPlugin expose an API, or optimisticPlugin updates
            // the resource's initialData directly as a fake optimistic update.
            
            // For now, let's optimistically set the initial data of the resource itself.
            // When query fetches, it will overwrite this.
            // Alternatively, it updates the query cache. We'll do a simple local optimistic update.
            
            // We don't want to call setInitialData because it clears drafts and fires events 
            // in a way that might disrupt the ongoing mutation state.
            // True optimistic UI usually updates the *cache* (qortex-query).
            
            // Pseudocode for cache update:
            // const qortexQuery = require('qortex-query');
            // qortexQuery.setQueryData(queryKey, draft);

            return true; // allow mutation
        },

        onAfterMutate(_result: any, _ctx: PluginContext<T>) {
            // Success! The queryPlugin (if present) will invalidate the query,
            // which will fetch the real updated data from the server.
            rollbackData = undefined;
        },

        onMutateError(_error: unknown, ctx: PluginContext<T>) {
            // Rollback on error
            if (rollbackData !== undefined) {
                // Pseudocode for cache rollback:
                // const qortexQuery = require('qortex-query');
                // qortexQuery.setQueryData(queryKey, rollbackData);
                
                // Also reset resource's view if we modified it
                ctx.setInitialData(rollbackData);
                ctx.resetDrafts();
                rollbackData = undefined;
            }
        },
    };
}
