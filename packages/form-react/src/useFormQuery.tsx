import { useMemo, type ComponentType, type ReactNode } from "react";
import type { Form, FormConfig, MutateMeta, SaveResult } from "qortex-form";
import { useQuery } from "qortex-query-react";
import type { QueryKey, QueryOptions, QueryState } from "qortex-query";
import { FormProvider } from "./FormProvider";
import { useForm } from "./useForm";
import {
    useFormMutation,
    type UseFormMutationOptions,
} from "./useFormMutation";

type FormConfigWithoutData<T> = Omit<FormConfig<T>, "data" | "key">;

export type UseFormQueryConfig<T> = FormConfigWithoutData<T> & {
    /**
     * Query + form identity. Used as `useQuery` key and default form `key`.
     * Also used as mutate `queryKey` so save invalidates → refetch fills `data`.
     */
    key: QueryKey;
    /** Load source data. Omit for create-only forms (use `initialData`). */
    fetcher?: () => Promise<T>;
    /** Persist draft via `form.save` → this mutator. */
    mutationFn: (draft: T, meta: MutateMeta) => Promise<unknown> | unknown;
    /** Pass-through query options (except `fetcher`, which comes from `fetcher`). */
    queryOptions?: Omit<QueryOptions<T>, "fetcher">;
    /**
     * Options forwarded to {@link useFormMutation}.
     * `queryKey` defaults to `key`; pass `null` to skip invalidate.
     */
    mutateOptions?: Omit<UseFormMutationOptions<T>, "queryKey"> & {
        queryKey?: QueryKey | null;
    };
};

export type UseFormQueryResult<T> = ReturnType<typeof useForm<T>> & {
    /** Bound `FormProvider` for this form instance. */
    Provider: ComponentType<{ children: ReactNode }>;
    /** `() => form.save(mutateAsync)`. */
    save: () => Promise<SaveResult>;
    /** True while the query has no data yet and is loading. */
    isLoading: boolean;
    /** True while mutation is in flight. */
    isSaving: boolean;
    /** Query or mutation error (mutation preferred when both set). */
    error: unknown;
    /** Underlying query state. */
    query: QueryState<T>;
    /** Mutation `isPending` / `error` / `data` / `reset`. */
    mutation: {
        isPending: boolean;
        error: Error | undefined;
        data: unknown | undefined;
        reset: () => void;
    };
};

/**
 * Batteries-included: `useQuery` + `useForm` + {@link useFormMutation} for edit
 * (or create-only) forms.
 *
 * - Fresh `data` comes from query refetch after invalidate — **not** from applying the save result.
 * - `save()` validates → `mutationFn(draft, meta)` → `resetDraft` on success.
 * - Create-only: omit `fetcher`, pass `initialData`.
 *
 * Requires `qortex-query-react` (peer dependency).
 *
 * @example
 * ```tsx
 * const { Provider, save, isLoading, isSaving, isChanged } = useFormQuery({
 *   key: ["user", id],
 *   fetcher: () => api.getUser(id),
 *   mutationFn: (draft) => api.updateUser(id, draft),
 *   validate: { fields: { name: (v) => (!v ? "Required" : null) } },
 * });
 *
 * if (isLoading) return <Spinner />;
 * return (
 *   <Provider>
 *     <NameField />
 *     <button disabled={!isChanged || isSaving} onClick={() => save()}>Save</button>
 *   </Provider>
 * );
 * ```
 */
export function useFormQuery<T>(config: UseFormQueryConfig<T>): UseFormQueryResult<T> {
    const {
        key,
        fetcher,
        mutationFn,
        queryOptions,
        mutateOptions,
        initialData,
        ...restFormConfig
    } = config;

    const hasFetcher = typeof fetcher === "function";

    const query = useQuery<T>(key, {
        ...queryOptions,
        fetcher,
        enabled: hasFetcher ? (queryOptions?.enabled ?? true) : false,
    });

    const formState = useForm<T>({
        ...restFormConfig,
        key,
        data: hasFetcher ? query.data : undefined,
        initialData: hasFetcher ? undefined : initialData,
    } as FormConfig<T>);

    const { queryKey: mutateQueryKey, ...mutationCallbacks } = mutateOptions ?? {};
    const invalidateKey =
        mutateQueryKey === null ? undefined : (mutateQueryKey ?? key);

    const wired = useFormMutation(formState.form, mutationFn, {
        ...mutationCallbacks,
        queryKey: invalidateKey,
    });

    const Provider = useMemo(() => {
        const BoundProvider = ({ children }: { children: ReactNode }) => (
            <FormProvider form={formState.form as Form<T>}>{children}</FormProvider>
        );
        BoundProvider.displayName = "FormQueryProvider";
        return BoundProvider;
    }, [formState.form]);

    return {
        ...formState,
        save: wired.save,
        Provider,
        isLoading: hasFetcher ? query.isLoading : false,
        isSaving: wired.isSaving,
        error: wired.error ?? query.error,
        query,
        mutation: {
            isPending: wired.isSaving,
            error: wired.error,
            data: wired.data,
            reset: wired.reset,
        },
    };
}
