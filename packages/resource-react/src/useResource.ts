import { useSyncExternalStore, useMemo, useEffect, useRef } from "react";
import { createResource } from "qortex-resource";
import type { ResourceConfig, ResourceSnapshot, Resource } from "qortex-resource";
import { bindResourceActions, serializeResourceKey } from "./bindResourceActions";

/**
 * Create a resource for the lifetime of the component and subscribe to its snapshot.
 *
 * Recreates when `config.key` changes (same key used for persist/cache identity).
 * Other config values are captured at creation — remount or change `key` to apply
 * a new identity (e.g. different entity id).
 *
 * @param config - Resource configuration
 * @returns Snapshot fields, bound actions, and the raw `resource` instance
 *
 * @example
 * ```tsx
 * const { draft, isSaving, set, save } = useResource({
 *   key: userId,
 *   source: {
 *     fetch: () => api.getUser(userId),
 *     save: (draft) => api.updateUser(draft),
 *   },
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

    const actions = useMemo(() => bindResourceActions(resource), [resource]);

    return {
        ...snapshot,
        ...actions,
        resource,
    };
}
