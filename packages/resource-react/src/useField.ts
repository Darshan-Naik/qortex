import { useSyncExternalStore, useCallback } from "react";
import type { Resource, FieldState, PathOf, PathValue } from "qortex-resource";

/**
 * Subscribe to a single field with fine-grained updates.
 *
 * Re-renders only when this path's value or meta changes (including when a
 * child path under it changes). Uses `getFieldState` so the snapshot is
 * referentially stable while unchanged.
 *
 * @param resource - Resource instance
 * @param path - Dot-notation path (typed via {@link PathOf} when `T` is known)
 * @returns Field state plus `onChange` / `onBlur` / `reset` helpers
 *
 * @example
 * ```tsx
 * function NameInput({ resource }: { resource: Resource<User> }) {
 *   const { value, error, onChange, onBlur } = useField(resource, "name");
 *   return (
 *     <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
 *   );
 * }
 * ```
 */
export function useField<T, P extends PathOf<T>>(
    resource: Resource<T>,
    path: P,
): FieldState<PathValue<T, P>> & {
    onChange: (value: PathValue<T, P> | ((prev: PathValue<T, P>) => PathValue<T, P>)) => void;
    onBlur: () => void;
    reset: () => void;
};
export function useField<V = any>(
    resource: Resource<any>,
    path: string,
): FieldState<V> & {
    onChange: (value: V | ((prev: V) => V)) => void;
    onBlur: () => void;
    reset: () => void;
};
export function useField(resource: Resource<any>, path: string) {
    const state = useSyncExternalStore(
        (listener) => resource.subscribeField(path, listener),
        () => resource.getFieldState(path),
    );

    const onChange = useCallback(
        (value: any) => {
            resource.set(path, value);
        },
        [resource, path],
    );

    const onBlur = useCallback(() => {
        resource.touch(path);
    }, [resource, path]);

    const reset = useCallback(() => {
        resource.reset(path);
    }, [resource, path]);

    return {
        ...state,
        onChange,
        onBlur,
        reset,
    };
}
