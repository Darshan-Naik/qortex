import { useSyncExternalStore } from "react";
import { createResource } from "qortex-resource";
import { useField } from "./useField";
import { useFieldArray } from "./useFieldArray";
import { bindResourceActions } from "./bindResourceActions";
import type { ResourceConfig, Resource } from "qortex-resource";

/**
 * Factory to create module-level bound hooks for a specific resource configuration.
 *
 * Returns pre-bound hooks that share one module-scoped resource instance
 * (no React Context). Call `destroy()` if you need to tear it down (HMR/tests).
 *
 * @example
 * ```ts
 * export const { useResource, useField, destroy } = createResourceHooks({
 *   fields: { name: { editable: true } },
 * });
 * ```
 */
export function createResourceHooks<T, R = T>(config: ResourceConfig<T, R>) {
    const resourceInstance: Resource<T, R> = createResource(config);
    const actions = bindResourceActions(resourceInstance);

    function useBoundResource() {
        const snapshot = useSyncExternalStore(
            (listener: any) => resourceInstance.subscribe(listener),
            () => resourceInstance.snapshot,
        );

        return {
            ...snapshot,
            ...actions,
            resource: resourceInstance,
        };
    }

    function useBoundField(path: string) {
        return useField(resourceInstance, path);
    }

    function useBoundFieldArray(path: string) {
        return useFieldArray(resourceInstance, path);
    }

    return {
        useResource: useBoundResource,
        useField: useBoundField,
        useFieldArray: useBoundFieldArray,
        resource: resourceInstance,
        destroy: () => resourceInstance.destroy(),
    };
}
