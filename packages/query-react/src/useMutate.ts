import { invalidateQuery, QueryKey } from "@qortex/query";
import { useState } from "react";

/** Internal: Generic mutation function type for inference */
type MutationFn = (...args: any[]) => Promise<any>;

/** Internal: Infers the return data type from a mutation function */
type InferData<Fn extends MutationFn> = Awaited<ReturnType<Fn>>;

/** Internal: Infers the arguments tuple type from a mutation function */
type InferArgs<Fn extends MutationFn> = Parameters<Fn>;

/** Internal: Options type for inferred overload (without mutationFn) */
type OptionsInferred<Fn extends MutationFn, Err = Error> = {
  onSuccess?: (data: InferData<Fn>, args: InferArgs<Fn>) => void;
  onError?: (error: Err, args: InferArgs<Fn>) => void;
  onSettled?: (
    data: InferData<Fn> | undefined,
    error: Err | undefined,
    args: InferArgs<Fn>
  ) => void;
  queryKey?: QueryKey;
};

/** Internal: Result type for inferred overload */
type ResultInferred<Fn extends MutationFn, Err> = {
  isPending: boolean;
  error: Err | undefined;
  data: InferData<Fn> | undefined;
  mutate: (...args: InferArgs<Fn>) => void;
  mutateAsync: (...args: InferArgs<Fn>) => Promise<InferData<Fn>>;
  reset: () => void;
};

/**
 * Optional configuration for the useMutate hook.
 * Pass as the second argument after the mutation function.
 *
 * @template Data - The type of data returned by the mutation
 * @template Err - The type of error that can be thrown (defaults to Error)
 * @template Args - The tuple type of arguments passed to the mutation (defaults to [])
 *
 * @example
 * ```tsx
 * const options: UseMutateOptions<Todo, Error, [CreateInput]> = {
 *   onSuccess: (data) => console.log(data.id),
 *   queryKey: ['todos'],
 * };
 * ```
 */
export type UseMutateOptions<
  Data = any,
  Err = Error,
  Args extends any[] = []
> = {
  /**
   * Callback fired when the mutation succeeds.
   * @param data - The data returned from the mutation
   * @param args - The arguments that were passed to the mutation
   */
  onSuccess?: (data: Data, args: Args) => void;

  /**
   * Callback fired when the mutation fails.
   * @param error - The error thrown by the mutation
   * @param args - The arguments that were passed to the mutation
   */
  onError?: (error: Err, args: Args) => void;

  /**
   * Callback fired when the mutation completes (success or error).
   * @param data - The data returned from the mutation (undefined if error)
   * @param error - The error thrown by the mutation (undefined if success)
   * @param args - The arguments that were passed to the mutation
   */
  onSettled?: (
    data: Data | undefined,
    error: Err | undefined,
    args: Args
  ) => void;

  /**
   * Optional query key to invalidate after successful mutation.
   * If provided, the query will be refetched after mutation completes.
   */
  queryKey?: QueryKey;
};

/**
 * Return type for the useMutate hook.
 *
 * @template Data - The type of data returned by the mutation
 * @template Err - The type of error that can be thrown
 * @template Args - The tuple type of arguments passed to the mutation
 *
 * @example
 * ```tsx
 * const result: UseMutateResult<Todo, Error, [CreateInput]> = useMutate(createTodo);
 * result.mutate({ title: 'New Todo' });
 * ```
 */
export type UseMutateResult<Data, Err, Args extends any[]> = {
  /** Whether the mutation is currently in progress */
  isPending: boolean;
  /** The error thrown by the last mutation attempt, or undefined */
  error: Err | undefined;
  /** The data returned by the last successful mutation, or undefined */
  data: Data | undefined;
  /** Function to trigger the mutation */
  mutate: (...args: Args) => void;
  /** Function to trigger the mutation and return a promise */
  mutateAsync: (...args: Args) => Promise<Data>;
  /** Resets the mutation state to its initial values */
  reset: () => void;
};

/**
 * A hook for handling asynchronous mutations with loading, error, and success states.
 *
 * @param mutationFn - The async function that performs the mutation (required)
 * @param options - Optional configuration (callbacks, queryKey to invalidate)
 *
 * Supports two usage patterns:
 * 1. **Inferred types**: Let TypeScript infer types from mutationFn (recommended)
 * 2. **Explicit generics**: Specify Data, Error, and Args types manually
 *
 * @example
 * ```tsx
 * // Simple usage - just pass the mutation function
 * const { mutate, isPending } = useMutate(api.createTodo);
 * mutate({ title: 'New Todo' });
 *
 * // With options - callbacks and query invalidation
 * const { mutate, data } = useMutate(
 *   async (newTodo: { title: string }) => {
 *     const res = await fetch('/api/todos', {
 *       method: 'POST',
 *       body: JSON.stringify(newTodo),
 *     });
 *     return res.json() as Promise<{ id: string; title: string }>;
 *   },
 *   {
 *     onSuccess: (data, [todo]) => console.log('Created:', data.id, todo.title),
 *     onError: (error) => console.error('Failed:', error),
 *     queryKey: ['todos'], // Invalidate todos query after mutation
 *   }
 * );
 * mutate({ title: 'New Todo' });
 *
 * // Multiple arguments - all types inferred
 * const { mutate: updateTodo } = useMutate(
 *   async (id: string, title: string, completed: boolean) => {
 *     return await api.updateTodo(id, { title, completed });
 *   },
 *   { onSuccess: (data, [id, title]) => console.log(`Updated ${id}: ${title}`) }
 * );
 * updateTodo('123', 'Updated Title', true);
 *
 * // Explicit generics - when you need to override inferred types
 * type Todo = { id: string; title: string };
 * const { mutate } = useMutate<Todo, Error, [{ title: string }]>(
 *   async (input) => api.createTodo(input),
 *   { onSuccess: (data) => console.log(data.id) }
 * );
 * ```
 */

// Overload 1: Inferred types from mutationFn (most common)
export function useMutate<Fn extends MutationFn, Err = Error>(
  mutationFn: Fn,
  options?: OptionsInferred<Fn, Err>
): ResultInferred<Fn, Err>;

// Overload 2: Explicit generics - user specifies Data, Err, Args
export function useMutate<Data, Err = Error, Args extends any[] = []>(
  mutationFn: (...args: Args) => Promise<Data>,
  options?: UseMutateOptions<Data, Err, Args>
): UseMutateResult<Data, Err, Args>;

// Implementation
export function useMutate<Data = any, Err = Error, Args extends any[] = any[]>(
  mutationFn: (...args: Args) => Promise<Data>,
  options: UseMutateOptions<Data, Err, Args> = {}
): UseMutateResult<Data, Err, Args> {
  const { onSuccess, onError, onSettled, queryKey } = options;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Err | undefined>(undefined);
  const [data, setData] = useState<Data | undefined>(undefined);

  const reset = () => {
    setIsPending(false);
    setError(undefined);
    setData(undefined);
  };

  const mutateAsync = async (...args: Args): Promise<Data> => {
    // Clear previous state and start pending
    setError(undefined);
    setData(undefined);
    setIsPending(true);

    try {
      const result = await mutationFn(...args);
      setData(result);
      onSuccess?.(result, args);
      onSettled?.(result, undefined, args);
      return result;
    } catch (err) {
      const caughtError = err as Err;
      setError(caughtError);
      onError?.(caughtError, args);
      onSettled?.(undefined, caughtError, args);
      throw caughtError;
    } finally {
      setIsPending(false);
      // Invalidate query after mutation completes (success or error)
      if (queryKey) invalidateQuery(queryKey);
    }
  };

  const mutate = (...args: Args): void => {
    mutateAsync(...args).catch(() => {
      // Error is already handled in mutateAsync and stored in state
    });
  };

  return {
    isPending,
    error,
    data,
    mutate,
    mutateAsync,
    reset,
  };
}
