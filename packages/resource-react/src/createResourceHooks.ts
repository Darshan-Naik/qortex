import { useSyncExternalStore } from "react";
import { createResource } from "qortex-resource";
import { useField } from "./useField";
import { useFieldArray } from "./useFieldArray";
import type { ResourceConfig, Resource } from "qortex-resource";

/**
 * Factory to create module-level bound hooks for a specific resource configuration.
 *
 * This enables "Pattern 1" (no prop drilling, no context) by returning pre-bound
 * hooks that share the same resource instance config.
 *
 * @param config - Resource configuration
 * @returns Bound hooks (useResource, useField, useFieldArray)
 *
 * @example
 * ```ts
 * export const { useResource, useField } = createResourceHooks({
 *   fields: { name: { editable: true } },
 * });
 *
 * // In component:
 * const { value } = useField('name'); // No resource instance needed!
 * ```
 */
export function createResourceHooks<T, R = T>(config: ResourceConfig<T, R>) {
    const resourceInstance: Resource<T, R> = createResource(config);

    function useBoundResource() {
        const snapshot = useSyncExternalStore(
            (listener: any) => resourceInstance.subscribe(listener),
            () => resourceInstance.snapshot
        );

        return {
            ...snapshot,
            set: resourceInstance.set.bind(resourceInstance),
            setMany: resourceInstance.setMany.bind(resourceInstance),
            reset: resourceInstance.reset.bind(resourceInstance),
            resetDraft: resourceInstance.resetDraft.bind(resourceInstance),
            fetch: resourceInstance.fetch.bind(resourceInstance),
            refetch: resourceInstance.refetch.bind(resourceInstance),
            save: resourceInstance.save.bind(resourceInstance),
            validate: resourceInstance.validate.bind(resourceInstance),
            validateField: resourceInstance.validateField.bind(resourceInstance),
            validateFields: resourceInstance.validateFields.bind(resourceInstance),
            syncSource: resourceInstance.syncSource.bind(resourceInstance),
            resource: resourceInstance,
        };
    }

    function useBoundField<V = any>(path: string) {
        return useField<V>(resourceInstance, path);
    }

    function useBoundFieldArray<V = any>(path: string) {
        return useFieldArray<V>(resourceInstance, path);
    }

    return {
        useResource: useBoundResource,
        useField: useBoundField,
        useFieldArray: useBoundFieldArray,
        resource: resourceInstance,
    };
}
