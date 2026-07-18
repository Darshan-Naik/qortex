import { useSyncExternalStore, useMemo, useEffect, useRef } from "react";
import { createResource } from "qortex-resource";
import type { ResourceConfig, ResourceSnapshot, Resource, ResourceKey } from "qortex-resource";

function serializeResourceKey(key: ResourceKey | undefined): string {
    if (key == null) return "";
    if (Array.isArray(key)) return key.map(String).join("#");
    return String(key);
}

/**
 * React hook to create and manage a resource lifecycle.
 *
 * Creates a resource once per `config.key` (recreates when the key changes).
 * Other config fields are read at creation time — pass a new `key` when the
 * resource identity should change (e.g. different entity id).
 *
 * @param config - Resource configuration
 * @returns The full resource state and bound actions
 *
 * @example
 * ```tsx
 * const { draft, set, save } = useResource({
 *   key: userId,
 *   initialData: async () => api.getUser(userId),
 *   source: {
 *     save: async (draft) => api.updateUser(draft)
 *   }
 * });
 * ```
 */
export function useResource<T, R = T>(config: ResourceConfig<T, R>) {
    const keyStr = serializeResourceKey(config.key);
    const configRef = useRef(config);
    configRef.current = config;

    const resource = useMemo(
        () => createResource(configRef.current),
        [keyStr],
    );

    useEffect(() => {
        return () => {
            resource.destroy();
        };
    }, [resource]);

    const snapshot = useSyncExternalStore<ResourceSnapshot<T, R>>(
        (listener) => resource.subscribe(listener),
        () => resource.snapshot,
    );

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
        ...snapshot,
        ...actions,
        resource,
    };
}
