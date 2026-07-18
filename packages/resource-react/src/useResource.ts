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
 * const { draft, set, save } = useResource({
 *   initialData: async () => api.getUser(id),
 *   fields: { name: { editable: true } },
 *   source: {
 *     save: async (draft) => api.updateUser(draft)
 *   }
 * });
 * ```
 */
export function useResource<T, R = T>(config: ResourceConfig<T, R>) {
    // 1. Create a stable resource instance for the lifetime of the component
    const resource = useMemo(() => createResource(config), []);

    // Cleanup resource on unmount
    useEffect(() => {
        return () => {
            resource.destroy();
        };
    }, [resource]);

    // 2. Subscribe to the full snapshot
    const snapshot = useSyncExternalStore<ResourceSnapshot<T, R>>(
        (listener) => resource.subscribe(listener),
        () => resource.snapshot,
    );

    // 3. Bind actions so they don't need `resource.` prefix
    const actions = useMemo(
        () => ({
            set: resource.set.bind(resource),
            setMany: resource.setMany.bind(resource),
            reset: resource.reset.bind(resource),
            resetDraft: resource.resetDraft.bind(resource),
            fetch: resource.fetch.bind(resource),
            refetch: resource.refetch.bind(resource),
            save: resource.save.bind(resource),
            validate: resource.validate.bind(resource),
            validateField: resource.validateField.bind(resource),
            validateFields: resource.validateFields.bind(resource),
            syncSource: resource.syncSource.bind(resource),
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
