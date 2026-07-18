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
 *
 * @internal
 */
export interface ResourceSourceInternal<T = any, R = T> {
    /** Native async loader */
    fetch?: () => Promise<T> | T;
    /** Native async saver */
    save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
    /** Bridged query */
    query?: ExistingQuery<T>;
    /** Bridged mutation */
    mutation?: ExistingMutation<T, R>;
    /** Bridged store */
    state?: ExistingState<T>;
    /** Controlled value */
    value?: T;
    /** Controlled / store write-back */
    onChange?: (value: T) => void;
}

/**
 * Runtime config shape after public `ResourceConfig` is accepted.
 * Not part of the public API.
 *
 * @internal
 */
export interface InternalResourceConfig<T = any, R = T> extends ResourceBaseConfig<T, R> {
    /** Persist / cache identity */
    key?: ResourceKey;
    /** Local or async initial payload */
    initialData?: T | (() => T) | (() => Promise<T>);
    /** Flattened source adapters */
    source?: ResourceSourceInternal<T, R>;
    /** Fetch options */
    query?: ResourceQueryConfig<T>;
    /** Save options */
    mutation?: ResourceMutationConfig<T, R>;
    /** Draft / cache persistence */
    persist?: boolean | ResourcePersistConfig;
}
