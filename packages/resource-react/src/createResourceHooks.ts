import { useSyncExternalStore } from "react";
import { createResource } from "qortex-resource";
import { useField } from "./useField";
import { useFieldArray } from "./useFieldArray";
import { bindResourceActions } from "./bindResourceActions";
import type { ResourceConfig, Resource } from "qortex-resource";

/**
 * Create module-level bound hooks that share one resource instance.
 *
 * Avoids React Context and prop drilling. The instance is a module singleton —
 * suitable for a single form/screen. Call `destroy()` in tests or HMR cleanup.
 *
 * @param config - Resource configuration captured once at module init
 * @returns Bound `useResource` / `useField` / `useFieldArray`, plus `resource` and `destroy`
 *
 * @example
 * ```ts
 * // userForm.ts
 * export const { useResource, useField, useFieldArray, destroy } = createResourceHooks({
 *   initialData: { name: "", tags: [] as string[] },
 *   source: { save: (draft) => api.save(draft) },
 * });
 *
 * // NameField.tsx
 * const { value, onChange, onBlur } = useField("name");
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
