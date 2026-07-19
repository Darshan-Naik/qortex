import { useCallback } from "react";
import type { Form, FormMutator, MutateMeta, SaveResult } from "qortex-form";
import { useMutate, type UseMutateOptions } from "qortex-query-react";
import type { QueryKey } from "qortex-query";

export type UseFormMutationOptions<T, Err = Error> = {
    /** Invalidate this query key after mutate settles (success or error). */
    queryKey?: QueryKey;
    onSuccess?: (data: unknown, draft: T) => void;
    onError?: (error: Err, draft: T) => void;
    onSettled?: (
        data: unknown | undefined,
        error: Err | undefined,
        draft: T,
    ) => void;
};

export type UseFormMutationResult<Err = Error> = {
    /** `() => form.save(mutateAsync)` — validate → mutator → resetDraft on success. */
    save: () => Promise<SaveResult>;
    /** True while the mutate call is in flight. */
    isSaving: boolean;
    /** Last mutate error (not validation failure). */
    error: Err | undefined;
    /** Last successful mutate result. */
    data: unknown | undefined;
    /** Reset mutate state (`isSaving` / `error` / `data`). */
    reset: () => void;
};

/**
 * Wire an existing form to `useMutate` so `save()` runs `form.save(mutateAsync)`.
 *
 * Does not own the form or refetch — pass `queryKey` so invalidate → refetch
 * can refresh source `data` after a successful save.
 *
 * @example
 * ```tsx
 * const { form, isChanged } = useForm({ key: id, data: user });
 * const { save, isSaving, error } = useFormMutation(form, (draft) => api.update(id, draft), {
 *   queryKey: ["user", id],
 * });
 * ```
 */
export function useFormMutation<T, Err = Error>(
    form: Form<T>,
    mutationFn: (draft: T, meta: MutateMeta) => Promise<unknown> | unknown,
    options: UseFormMutationOptions<T, Err> = {},
): UseFormMutationResult<Err> {
    const { queryKey, onSuccess, onError, onSettled } = options;

    const mutateOpts: UseMutateOptions<unknown, Err, [T, MutateMeta]> = {
        queryKey,
        onSuccess: (data, [draft]) => onSuccess?.(data, draft),
        onError: (error, [draft]) => onError?.(error, draft),
        onSettled: (data, error, [draft]) => onSettled?.(data, error, draft),
    };

    const mutation = useMutate(
        async (draft: T, meta: MutateMeta) => mutationFn(draft, meta),
        mutateOpts,
    );

    const save = useCallback(async (): Promise<SaveResult> => {
        const mutator: FormMutator<T> = (draft, meta) =>
            mutation.mutateAsync(draft, meta);
        return form.save(mutator);
    }, [form, mutation]);

    return {
        save,
        isSaving: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
}
