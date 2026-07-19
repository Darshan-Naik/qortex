import { useRef, useSyncExternalStore } from "react";
import type { FormConfig } from "qortex-form";
import { useForm } from "./useForm";

// FormPersistConfigUnion is a discriminated union; spreading Omit configs needs a cast.

/**
 * Duck-typed store with get/subscribe (qortex-store compatible).
 * `set` is optional — this binder does not write back on save.
 */
export type FormStoreLike<S> = {
    get: () => S;
    subscribe: (listener: (state: S, prevState: S) => void) => () => void;
    set?: (
        partial: S | Partial<S> | ((state: S) => S | Partial<S>),
        replace?: boolean,
    ) => void;
};

export type UseFormStoreConfig<T, S = T> = Omit<FormConfig<T>, "data"> & {
    /** Store to read source data from. */
    store: FormStoreLike<S>;
    /** Pick the form payload from store state. Default: identity. */
    selector?: (state: S) => T;
};

/**
 * Create a form whose `data` stays in sync with a store (or duck-typed store).
 *
 * On successful `form.save(mutator)`, draft resets via the form — **store
 * write-back is the caller's concern** (e.g. update the store in your mutator
 * or after invalidate/refetch). This binder only reads.
 *
 * @example
 * ```tsx
 * const { form, draft, isChanged, save } = useFormStore({
 *   store: settingsStore,
 *   selector: (s) => s.profile,
 *   validate: { fields: { name: (v) => (!v ? "Required" : null) } },
 * });
 * ```
 */
export function useFormStore<T, S = T>(config: UseFormStoreConfig<T, S>) {
    const { store, selector, ...formConfig } = config;
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const select = (state: S): T => {
        const sel = selectorRef.current;
        return sel ? sel(state) : (state as unknown as T);
    };

    const data = useSyncExternalStore(
        (onStoreChange) => store.subscribe(() => onStoreChange()),
        () => select(store.get()),
        () => select(store.get()),
    );

    const formState = useForm<T>({
        ...formConfig,
        data,
    } as FormConfig<T>);

    return formState;
}
