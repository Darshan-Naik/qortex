import { useSyncExternalStore, useMemo, useCallback, useRef } from "react";
import type { Resource } from "qortex-resource";

let idCounter = 0;
function generateId() {
    return `key_${idCounter++}`;
}

/**
 * React hook for array fields.
 *
 * Provides stable identity keys for React rendering and convenience
 * methods for array operations, backed by functional `setField`.
 *
 * @param resource - The resource instance
 * @param path - Dot-notation path to the array field
 * @returns Stable fields array and mutation helpers
 *
 * @example
 * ```tsx
 * const { fields, append, remove } = useFieldArray(resource, 'contacts');
 * return fields.map((field, index) => <div key={field.id}>...</div>);
 * ```
 */
export function useFieldArray<T = any>(resource: Resource<any>, path: string) {
    // 1. Subscribe to the array's state
    // We only care about the array reference/length changing, not deep children changes
    // (children should use useField(`contacts.${index}.name`)).
    // However, for simplicity, we subscribe to the path.
    const arrayState = useSyncExternalStore(
        (listener) => resource.subscribeField(path, listener),
        () => resource.field(path),
    );

    const value = (arrayState.value as any[]) || [];

    // 2. Manage stable keys
    const keyMap = useRef(new Map<any, string>());
    const fieldsWithKeys = useMemo(() => {
        // We try to generate and persist keys for array items.
        // In a real robust implementation, the core might need to track keys internally.
        // Doing it at the hook level is slightly fragile if the array is modified
        // outside this hook (e.g., resource.set('contacts', [new array])).
        // We do a best-effort tracking here based on item identity if possible,
        // or just sequentially if items are primitives.
        
        const newMap = new Map<any, string>();
        const result = value.map((item, index) => {
            // Primitive values can't be keys in WeakMap/Map safely if duplicated.
            // Using index fallback if we must, but it breaks 'stable' property on reorder.
            // A better way is wrapping items, but that pollutes data.
            // For this implementation, we'll assign a unique ID object per index on mount, 
            // but this is a simplified version.
            let id = keyMap.current.get(item);
            if (!id) {
                id = generateId();
            }
            newMap.set(item, id);
            return { id, index, item };
        });
        keyMap.current = newMap;
        return result;
    }, [value]);

    // 3. Convenience Methods (all map to set functionally)
    const append = useCallback((item: T) => {
        resource.set(path, (prev: any[]) => [...(prev || []), item]);
    }, [resource, path]);

    const prepend = useCallback((item: T) => {
        resource.set(path, (prev: any[]) => [item, ...(prev || [])]);
    }, [resource, path]);

    const remove = useCallback((index: number) => {
        resource.set(path, (prev: any[]) => {
            if (!prev) return prev;
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    }, [resource, path]);

    const insert = useCallback((index: number, item: T) => {
        resource.set(path, (prev: any[]) => {
            if (!prev) return [item];
            const next = [...prev];
            next.splice(index, 0, item);
            return next;
        });
    }, [resource, path]);

    const swap = useCallback((indexA: number, indexB: number) => {
        resource.set(path, (prev: any[]) => {
            if (!prev) return prev;
            const next = [...prev];
            const temp = next[indexA];
            next[indexA] = next[indexB];
            next[indexB] = temp;
            return next;
        });
    }, [resource, path]);

    const move = useCallback((from: number, to: number) => {
        resource.set(path, (prev: any[]) => {
            if (!prev) return prev;
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    }, [resource, path]);

    return {
        fields: fieldsWithKeys,
        append,
        prepend,
        remove,
        insert,
        swap,
        move,
    };
}
