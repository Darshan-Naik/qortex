import { useSyncExternalStore, useMemo, useEffect, useRef } from "react";
import { createResource } from "qortex-resource";
import type { ResourceConfig, ResourceSnapshot, Resource } from "qortex-resource";
import { bindResourceActions, serializeResourceKey } from "./bindResourceActions";

/**
 * React hook to create and manage a resource lifecycle.
 *
 * Creates a resource once per `config.key` (recreates when the key changes).
 * Other config fields are read at creation time — pass a new `key` when the
 * resource identity should change (e.g. different entity id).
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
