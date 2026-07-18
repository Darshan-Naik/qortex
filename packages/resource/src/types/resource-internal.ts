import type {
    ExistingMutation,
    ExistingQuery,
    ExistingState,
    MutateMeta,
    ResourceBaseConfig,
    ResourceKey,
    ResourceMutationConfig,
    ResourcePersistConfig,
    ResourceQueryConfig,
} from "./resource";

/**
 * Flattened source shape used inside ResourceCore.
 * Public `ResourceConfig` keeps a discriminated union for consumers;
 * internals widen to this so property access type-checks.
 */
export interface ResourceSourceInternal<T = any, R = T> {
    fetch?: () => Promise<T> | T;
    save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
    query?: ExistingQuery<T>;
    mutation?: ExistingMutation<T, R>;
    state?: ExistingState<T>;
    value?: T;
    onChange?: (value: T) => void;
}

/**
 * Runtime config shape after public `ResourceConfig` is accepted.
 * Not part of the public API.
 */
export interface InternalResourceConfig<T = any, R = T> extends ResourceBaseConfig<T, R> {
    key?: ResourceKey;
    initialData?: T | (() => T) | (() => Promise<T>);
    source?: ResourceSourceInternal<T, R>;
    query?: ResourceQueryConfig<T>;
    mutation?: ResourceMutationConfig<T, R>;
    persist?: boolean | ResourcePersistConfig;
}
