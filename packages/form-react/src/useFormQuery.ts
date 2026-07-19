import { useQuery } from "qortex-query-react";
import type {
    QueryKey,
    QueryOptions,
    QueryState,
    Fetcher,
    InferFetcherResult,
} from "qortex-query";

/**
 * Thin helper that runs `useQuery` and surfaces load flags for forms.
 *
 * Prefer {@link useQueryForm} for the full query + form + mutate combo.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useFormQuery(["user", id], {
 *   fetcher: () => api.getUser(id),
 * });
 * const { form } = useForm({ key: ["user", id], data });
 * ```
 */
export function useFormQuery<F extends Fetcher>(
    key: QueryKey,
    opts: QueryOptions<InferFetcherResult<F>> & { fetcher: F },
): QueryState<InferFetcherResult<F>>;

export function useFormQuery<T = any>(
    key: QueryKey,
    opts?: QueryOptions<T>,
): QueryState<T>;

export function useFormQuery<T = any>(
    key: QueryKey,
    opts?: QueryOptions<T>,
): QueryState<T> {
    return useQuery<T>(key, opts);
}
