import { useSyncExternalStore } from "react";
import type { Resource, PathOf, PathValue, ArrayFieldEntry } from "qortex-resource";

type ArrayItem<T, P extends string> = PathValue<T, P> extends readonly (infer I)[] ? I : any;

/**
 * Subscribe to an array field and expose list helpers.
 *
 * Item `id`s are owned by the resource core and stay stable across reorder /
 * duplicate primitives. Prefer nested `useField(resource, \`${path}.${i}.…\`)`
 * for item fields.
 *
 * @param resource - Resource instance
 * @param path - Path to an array value
 * @returns `fields` (with stable ids) and append/remove/swap/move helpers
 *
 * @example
 * ```tsx
 * const { fields, append, remove } = useFieldArray(resource, "tags");
 * return fields.map((f) => (
 *   <li key={f.id}>{f.item}<button onClick={() => remove(f.index)}>×</button></li>
 * ));
 * ```
 */
export function useFieldArray<T, P extends PathOf<T>>(
    resource: Resource<T>,
    path: P,
): {
    fields: ArrayFieldEntry<ArrayItem<T, P & string>>[];
    append: (item: ArrayItem<T, P & string>) => void;
    prepend: (item: ArrayItem<T, P & string>) => void;
    remove: (index: number) => void;
    insert: (index: number, item: ArrayItem<T, P & string>) => void;
    swap: (indexA: number, indexB: number) => void;
    move: (from: number, to: number) => void;
};
export function useFieldArray<T = any>(
    resource: Resource<any>,
    path: string,
): {
    fields: ArrayFieldEntry<T>[];
    append: (item: T) => void;
    prepend: (item: T) => void;
    remove: (index: number) => void;
    insert: (index: number, item: T) => void;
    swap: (indexA: number, indexB: number) => void;
    move: (from: number, to: number) => void;
};
export function useFieldArray(resource: Resource<any>, path: string) {
    useSyncExternalStore(
        (listener) => resource.subscribeField(path, listener),
        () => resource.field(path),
    );

    const array = resource.array(path);

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
