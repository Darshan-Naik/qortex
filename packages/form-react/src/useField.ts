import { useSyncExternalStore, useCallback } from "react";
import type { FieldState, PathOf, PathValue } from "qortex-form";
import { useFormContext } from "./FormProvider";

/**
 * Subscribe to a single field via {@link FormProvider} context.
 *
 * Re-renders only when this path's value or meta changes.
 * Requires a surrounding `FormProvider`.
 *
 * @param path - Dot-notation path
 * @returns Field state plus `onChange` / `onBlur` / `reset` helpers
 *
 * @example
 * ```tsx
 * function NameInput() {
 *   const { value, error, onChange, onBlur } = useField("name");
 *   return (
 *     <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
 *   );
 * }
 * ```
 */
export function useField<T, P extends PathOf<T>>(
    path: P,
): FieldState<PathValue<T, P>> & {
    onChange: (value: PathValue<T, P> | ((prev: PathValue<T, P>) => PathValue<T, P>)) => void;
    onBlur: () => void;
    reset: () => void;
};
export function useField<V = any>(
    path: string,
): FieldState<V> & {
    onChange: (value: V | ((prev: V) => V)) => void;
    onBlur: () => void;
    reset: () => void;
};
export function useField(path: string) {
    const form = useFormContext();

    const state = useSyncExternalStore(
        (listener) => form.subscribeField(path, listener),
        () => form.getFieldState(path),
    );

    const onChange = useCallback(
        (value: any) => {
            form.set(path, value);
        },
        [form, path],
    );

    const onBlur = useCallback(() => {
        form.touch(path);
    }, [form, path]);

    const reset = useCallback(() => {
        form.reset(path);
    }, [form, path]);

    return {
        ...state,
        onChange,
        onBlur,
        reset,
    };
}
