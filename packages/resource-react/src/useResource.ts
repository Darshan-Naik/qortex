import { useSyncExternalStore, useMemo, useEffect } from "react";
import { createResource } from "qortex-resource";
import type { ResourceConfig, ResourceSnapshot, Resource } from "qortex-resource";

/**
 * React hook to create and manage a resource lifecycle.
 *
 * It automatically subscribes to the resource state and triggers
 * re-renders when the state changes.
 *
 * @param config - Resource configuration
 * @returns The full resource state and bound actions
 *
 * @example
 * ```tsx
 * const { updatedData, setField, mutate } = useResource({
 *   initialData: async () => api.getUser(id),
 *   fields: { name: { editable: true } },
 *   mutate: async (initial, updated) => api.updateUser(updated),
 * });
 * ```
 */
export function useResource<T>(config: ResourceConfig<T>) {
    // 1. Create a stable resource instance for the lifetime of the component
    // If the config structurally changes a lot, you might need memoization of the config
    // or a mechanism to update the resource's config without recreating it.
    // For simplicity in this implementation, we assume the initial config drives creation.
    // In a production hook, you'd likely want to handle dynamic config changes carefully.
    const resource = useMemo(() => createResource(config), []);

    // Cleanup resource on unmount
    useEffect(() => {
        return () => {
            resource.destroy();
        };
    }, [resource]);

    // 2. Subscribe to the full snapshot
    // Note: This causes a re-render on ANY field change.
    // For fine-grained rendering, components should use `useField(resource, 'path')`.
    const snapshot = useSyncExternalStore(
        (listener) => resource.subscribe(listener),
        () => resource.get(),
    );

    // 3. Bind actions so they don't need `resource.` prefix
    const actions = useMemo(
        () => ({
            setField: resource.setField.bind(resource),
            setFields: resource.setFields.bind(resource),
            resetField: resource.resetField.bind(resource),
            resetAll: resource.resetAll.bind(resource),
            mutate: resource.mutate.bind(resource),
            mutateAsync: resource.mutateAsync.bind(resource),
            validate: resource.validate.bind(resource),
            setInitialData: resource.setInitialData.bind(resource),
        }),
        [resource],
    );

    return {
        // Return full snapshot state
        ...snapshot,
        // Bound actions
        ...actions,
        // The raw resource instance (for passing to useField, etc.)
        resource,
    };
}
