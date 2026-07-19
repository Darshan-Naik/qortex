import { useSyncExternalStore } from "react";
import type { PathOf, PathValue, ArrayFieldEntry } from "qortex-form";
import { useFormContext } from "./FormProvider";

type ArrayItem<T, P extends string> = PathValue<T, P> extends readonly (infer I)[] ? I : any;

/**
 * Subscribe to an array field via {@link FormProvider} context.
 *
 * Requires a surrounding `FormProvider`. Prefer nested
 * `useField(\`${path}.${i}.…\`)` for item fields.
 *
 * @param path - Path to an array value
 * @returns `fields` (with stable ids) and append/remove/swap/move helpers
 */
export function useFieldArray<T, P extends PathOf<T>>(
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
export function useFieldArray(path: string) {
    const form = useFormContext();

    useSyncExternalStore(
        (listener) => form.subscribeField(path, listener),
        () => form.field(path),
    );

    const array = form.array(path);

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
