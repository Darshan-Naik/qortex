import { useSyncExternalStore } from "react";
import type { Resource } from "qortex-resource";

/**
 * React hook for array fields.
 *
 * Subscribes to the array path and delegates mutations to `resource.array()`.
 * Stable item ids come from the resource core (survive reorder / duplicate primitives).
 *
 * @param resource - The resource instance
 * @param path - Dot-notation path to the array field
 * @returns Stable fields array and mutation helpers
 *
 * @example
 * ```tsx
 * const { fields, append, remove } = useFieldArray(resource, 'contacts');
 * return fields.map((field) => <div key={field.id}>...</div>);
 * ```
 */
export function useFieldArray<T = any>(resource: Resource<any>, path: string) {
    // Subscribe via field controller identity (new ref when value/meta changes).
    useSyncExternalStore(
        (listener) => resource.subscribeField(path, listener),
        () => resource.field(path),
    );

    const array = resource.array<T>(path);

    return {
        fields: array.fields,
        append: array.append,
        prepend: array.prepend,
        remove: array.remove,
        insert: array.insert,
        swap: array.swap,
        move: array.move,
    };
}
