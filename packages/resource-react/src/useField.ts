import { useSyncExternalStore, useCallback } from "react";
import type { Resource, FieldState, PathOf, PathValue } from "qortex-resource";

/**
 * React hook for fine-grained field subscription.
 *
 * Uses `getFieldState` for a stable snapshot identity when value/meta are unchanged.
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
