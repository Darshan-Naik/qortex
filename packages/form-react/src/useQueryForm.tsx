import { useCallback, useMemo, type ComponentType, type ReactNode } from "react";
import type {
    Form,
    FormConfig,
    FormMutator,
    MutateMeta,
    SaveResult,
} from "qortex-form";
import { useQuery, useMutate, type UseMutateOptions } from "qortex-query-react";
import type { QueryKey, QueryOptions, QueryState } from "qortex-query";
import { FormProvider } from "./FormProvider";
import { useForm } from "./useForm";

type FormConfigWithoutData<T> = Omit<FormConfig<T>, "data" | "key">;

export type UseQueryFormConfig<T> = FormConfigWithoutData<T> & {
    /**
     * Query + form identity. Used as `useQuery` key and default form `key`.
     * Also used as `useMutate({ queryKey })` so save invalidates → refetch fills `data`.
     */
    key: QueryKey;
    /** Load source data. Omit for create-only forms (use `initialData`). */
    fetcher?: () => Promise<T>;
    /** Persist draft via `form.save` → this mutator. */
    mutationFn: (draft: T, meta: MutateMeta) => Promise<unknown> | unknown;
    /** Pass-through query options (except `fetcher`, which comes from `fetcher`). */
    queryOptions?: Omit<QueryOptions<T>, "fetcher">;
    /** Pass-through mutate callbacks (queryKey defaults to `key`). */
    mutateOptions?: Omit<UseMutateOptions<unknown, Error, [T, MutateMeta]>, "queryKey"> & {
        /** Override invalidate key; defaults to `key`. Pass `null` to skip invalidate. */
        queryKey?: QueryKey | null;
    };
};

export type UseQueryFormResult<T> = ReturnType<typeof useForm<T>> & {
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
 * Batteries-included: `useQuery` + `useForm` + `useMutate` for edit (or create-only) forms.
 *
 * - Fresh `data` comes from query refetch after invalidate — **not** from applying the save result.
 * - `save()` validates → `mutationFn(draft, meta)` → `resetDraft` on success.
 * - Create-only: omit `fetcher`, pass `initialData`.
 *
 * Requires `qortex-query-react` (peer dependency).
 *
 * @example
 * ```tsx
 * const { Provider, save, isLoading, isSaving, isChanged } = useQueryForm({
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
export function useQueryForm<T>(config: UseQueryFormConfig<T>): UseQueryFormResult<T> {
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

    const {
        queryKey: mutateQueryKey,
        ...mutateCallbacks
    } = mutateOptions ?? {};

    const invalidateKey =
        mutateQueryKey === null ? undefined : (mutateQueryKey ?? key);

    const mutation = useMutate(
        async (draft: T, meta: MutateMeta) => mutationFn(draft, meta),
        {
            ...mutateCallbacks,
            queryKey: invalidateKey,
        } as UseMutateOptions<unknown, Error, [T, MutateMeta]>,
    );

    const save = useCallback(async (): Promise<SaveResult> => {
        const mutator: FormMutator<T> = (draft, meta) =>
            mutation.mutateAsync(draft, meta);
        return formState.form.save(mutator);
    }, [formState.form, mutation]);

    const Provider = useMemo(() => {
        const BoundProvider = ({ children }: { children: ReactNode }) => (
            <FormProvider form={formState.form as Form<T>}>{children}</FormProvider>
        );
        BoundProvider.displayName = "QueryFormProvider";
        return BoundProvider;
    }, [formState.form]);

    const error = mutation.error ?? query.error;

    return {
        ...formState,
        // Override useForm.save with the wired mutate version
        save,
        Provider,
        isLoading: hasFetcher ? query.isLoading : false,
        isSaving: mutation.isPending,
        error,
        query,
        mutation: {
            isPending: mutation.isPending,
            error: mutation.error,
            data: mutation.data,
            reset: mutation.reset,
        },
    };
}
