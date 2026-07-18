import { useSyncExternalStore, useMemo, useCallback } from "react";
import type { Resource, FieldState } from "qortex-resource";

/**
 * React hook for fine-grained field subscription.
 *
 * Only re-renders when this specific field's value, meta, or error changes.
 * Avoids re-rendering the whole form on every keystroke.
 *
 * @param resource - The resource instance
 * @param path - Dot-notation path to the field
 * @returns Field state and bound event handlers (onChange, onBlur)
 *
 * @example
 * ```tsx
 * function NameField({ resource }) {
 *   const { value, error, onChange, onBlur } = useField(resource, 'name');
 *   return <input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} />;
 * }
 * ```
 */
export function useField<V = any>(resource: Resource<any>, path: string) {
    // Subscribe to ONLY this field's changes
    const state = useSyncExternalStore<FieldState<V>>(
        (listener) => resource.subscribeField(path, listener),
        () => resource.field<V>(path),
    );

    // Bound handlers
    const onChange = useCallback(
        (value: V | ((prev: V) => V)) => {
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
