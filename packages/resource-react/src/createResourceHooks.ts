import { useSyncExternalStore } from "react";
import { createResource } from "qortex-resource";
import { useResource } from "./useResource";
import { useField } from "./useField";
import { useFieldArray } from "./useFieldArray";
import type { ResourceConfig, Resource } from "qortex-resource";

/**
 * Factory to create module-level bound hooks for a specific resource configuration.
 *
 * This enables "Pattern 1" (no prop drilling, no context) by returning pre-bound
 * hooks that share the same resource instance config.
 *
 * NOTE: Since React hooks must be called inside components, the actual resource
 * instance is created lazily or managed outside React. For a singleton module-level
 * resource, `createResource` should be called once, and the hooks just bind to it.
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
export function createResourceHooks<T>(config: ResourceConfig<T>) {
    // We create a singleton instance for this module.
    // If you need dynamic config (like passing an ID), you should use Pattern 2 (Context)
    // or just the standard `useResource` hook directly.
    const resourceInstance: Resource<T> = createResource(config);

    function useBoundResource() {
        // We still need to subscribe to it in React land
        const snapshot = useSyncExternalStore(
            (listener: any) => resourceInstance.subscribe(listener),
            () => resourceInstance.get()
        );

        return {
            ...snapshot,
            setField: resourceInstance.setField.bind(resourceInstance),
            setFields: resourceInstance.setFields.bind(resourceInstance),
            resetField: resourceInstance.resetField.bind(resourceInstance),
            resetAll: resourceInstance.resetAll.bind(resourceInstance),
            mutate: resourceInstance.mutate.bind(resourceInstance),
            mutateAsync: resourceInstance.mutateAsync.bind(resourceInstance),
            validate: resourceInstance.validate.bind(resourceInstance),
            setInitialData: resourceInstance.setInitialData.bind(resourceInstance),
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
