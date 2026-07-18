import type { Resource } from "qortex-resource";

/**
 * Bound action methods returned alongside resource snapshots in React hooks.
 *
 * @internal Shared by `useResource` and `createResourceHooks`.
 */
export function bindResourceActions<T, R = T>(resource: Resource<T, R>) {
    return {
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
    };
}

/**
 * Normalize a resource `key` (string | number | tuple) for React memoization
 * and persist key derivation.
 *
 * @param key - Resource config key
 * @returns Stable string form (`""` when absent)
 */
export function serializeResourceKey(key: unknown): string {
    if (key == null) return "";
    if (Array.isArray(key)) return key.map(String).join("#");
    return String(key);
}
