import { useSyncExternalStore, useMemo, useEffect, useRef } from "react";
import { createForm } from "qortex-form";
import type { FormConfig, FormSnapshot, Form } from "qortex-form";
import { bindFormActions, serializeKey } from "./bindFormActions";

/**
 * Create a form for the lifetime of the component and subscribe to its snapshot.
 *
 * Recreates when `config.key` changes. Syncs `config.data` via `form.setData`
 * when it changes by `Object.is`. Does **not** wrap a provider — use
 * {@link FormProvider} so `useField` / `useFieldArray` can read context.
 *
 * @param config - Form configuration
 * @returns Snapshot fields, bound actions, and the raw `form` instance
 *
 * @example
 * ```tsx
 * const { draft, isChanged, set, save, form } = useForm({
 *   key: userId,
 *   data: serverUser,
 * });
 *
 * return (
 *   <FormProvider form={form}>
 *     <NameField />
 *   </FormProvider>
 * );
 * ```
 */
export function useForm<T>(config: FormConfig<T>) {
    const keyStr = serializeKey(config.key);
    const configRef = useRef(config);
    configRef.current = config;

    const form = useMemo(
        () => createForm(configRef.current),
        [keyStr],
    );

    useEffect(() => {
        return () => {
            form.destroy();
        };
    }, [form]);

    // Skip the first sync after create — createForm already applied data/initialData.
    // Only call setData when config.data changes for an existing form instance.
    const syncedRef = useRef<{ form: typeof form; data: T | undefined } | null>(null);
    useEffect(() => {
        const prev = syncedRef.current;
        if (!prev || prev.form !== form) {
            syncedRef.current = { form, data: config.data };
            return;
        }
        if (Object.is(prev.data, config.data)) return;
        syncedRef.current = { form, data: config.data };
        form.setData(config.data);
    }, [form, config.data]);

    const snapshot = useSyncExternalStore<FormSnapshot<T>>(
        (listener) => form.subscribe(listener),
        () => form.snapshot,
    );

    const actions = useMemo(() => bindFormActions(form), [form]);

    return {
        ...snapshot,
        ...actions,
        form,
    };
}
