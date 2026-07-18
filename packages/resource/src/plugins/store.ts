import type { Plugin, PluginContext, ResourceSnapshot } from "../types";

export interface ResourceStore<T = any> {
    get(): T;
    set(partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean): void;
    subscribe?(listener: (state: T, prevState: T) => void): () => void;
}

export interface StorePluginOptions<T = any, S = any> {
    /** qortex-store instance or compatible adapter. */
    store: ResourceStore<S>;
    /** Convert a resource snapshot into store state. Defaults to writing `{ resource: snapshot }`. */
    select?: (snapshot: ResourceSnapshot<T>) => S | Partial<S>;
    /** Whether to replace store state instead of shallow-merging. Default: false */
    replace?: boolean;
    /** Push the initial resource snapshot to the store on plugin init. Default: true */
    syncOnInit?: boolean;
    /** Push resource snapshots to the store whenever the resource changes. Default: true */
    syncOnChange?: boolean;
}

/**
 * Sync resource snapshots into a `qortex-store` store or compatible state adapter.
 *
 * @example
 * ```ts
 * import { createStore } from "qortex-store";
 * import { storePlugin } from "qortex-resource/store";
 *
 * const formStore = createStore({ resource: null });
 *
 * createResource({
 *   initialData: user,
 *   plugins: [storePlugin({ store: formStore })],
 * });
 * ```
 */
export function storePlugin<T = any, S = any>(
    options: StorePluginOptions<T, S>,
): Plugin<T> {
    const {
        store,
        select = (snapshot) => ({ resource: snapshot }) as unknown as Partial<S>,
        replace = false,
        syncOnInit = true,
        syncOnChange = true,
    } = options;

    function sync(ctx: PluginContext<T>): void {
        store.set(select(buildSnapshot(ctx)), replace);
    }

    return {
        name: "store",

        onInit(ctx) {
            if (syncOnInit) {
                sync(ctx);
            }

            if (!syncOnChange) {
                return undefined;
            }

            return ctx.subscribe((snapshot) => {
                store.set(select(snapshot), replace);
            });
        },
    };
}

function buildSnapshot<T>(ctx: PluginContext<T>): ResourceSnapshot<T> {
    const overrides = ctx.getDraftOverrides();
    const changedFields = [...overrides.keys()];

    return {
        data: ctx.getData(),
        draft: ctx.getUpdatedData(),
        status: "ready",
        error: undefined,
        isLoading: false,
        isFetching: false,
        isSaving: false,
        isChanged: changedFields.length > 0,
        isValid: true,
        changedFields,
        touchedFields: [],
        errors: {},
        query: {
            data: ctx.getData(),
            error: undefined,
            status: "success",
            isLoading: false,
            isFetching: false,
            isStale: false,
            updatedAt: undefined,
            fetch: async () => undefined,
            refetch: async () => undefined,
            invalidate: () => {},
            setEnabled: () => {},
            setStaleTime: () => {},
        },
        mutation: {
            status: "idle",
            error: undefined,
            data: undefined,
            isSaving: false,
            reset: () => {},
            retry: async () => ({ success: true, data: undefined, error: undefined }),
        },
    };
}
