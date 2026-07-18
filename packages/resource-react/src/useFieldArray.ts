import { useSyncExternalStore } from "react";
import type { Resource, PathOf, PathValue, ArrayFieldEntry } from "qortex-resource";

type ArrayItem<T, P extends string> = PathValue<T, P> extends readonly (infer I)[] ? I : any;

/**
 * React hook for array fields.
 *
 * Subscribes to the array path and delegates mutations to `resource.array()`.
 * Stable item ids come from the resource core (survive reorder / duplicate primitives).
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
