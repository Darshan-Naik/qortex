import type { Resource } from "qortex-resource";

/**
 * Bind resource mutation methods for hook return values.
 * Shared by `useResource` and `createResourceHooks`.
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

export function serializeResourceKey(key: unknown): string {
    if (key == null) return "";
    if (Array.isArray(key)) return key.map(String).join("#");
    return String(key);
}
