import { FieldState, FieldsConfig } from "./field";
import type { PathOf, PathValue } from "./path";

type Key = string | number | boolean | null | undefined;

/** Cache / persist identity. Prefer a stable string or tuple (e.g. `["user", id]`). */
export type ResourceKey = Key | readonly Key[];

/** Overall resource lifecycle status. */
export type ResourceStatus = "idle" | "loading" | "ready" | "error";

/** Save / mutation lifecycle status. */
export type MutationStatus = "idle" | "mutating" | "success" | "error";

/** Fetch / query lifecycle status. */
export type ResourceQueryStatus = "idle" | "fetching" | "success" | "error";

/**
 * When field validation runs automatically.
 * - `"change"` — after each `set`
 * - `"blur"` — after `touch` / blur
 * - `"submit"` — only during `save` / `validate`
 * - `"manual"` — only when you call `validate*` explicitly
 */
export type ValidationMode = "change" | "blur" | "submit" | "manual";

/**
 * How draft overrides behave when source data is replaced.
 * - `"keepDirty"` — keep local overrides that still differ from the new source
 * - `"resetDraft"` — clear overrides and field meta
 * - `"replaceAll"` — same as resetDraft today (full replace)
 */
export type SourceUpdateMode = "keepDirty" | "resetDraft" | "replaceAll";

/** Metadata passed to `source.save`. */
export interface MutateMeta {
    /** Paths with explicit draft overrides */
    changedFields: string[];
    /** True when there is at least one override */
    isChanged: boolean;
}

/** Result of `resource.save()` / mutation retry. */
export interface MutationResult<R = any> {
    success: boolean;
    data: R | undefined;
    error: unknown;
}

/** Result of form / multi-field validation. */
export interface ValidationResult {
    valid: boolean;
    /** Path → message; cleared paths may be present as `undefined` */
    errors: Record<string, string | undefined>;
}

/** Result of validating a single field path. */
export interface FieldValidationResult {
    path: string;
    valid: boolean;
    error: string | undefined;
}

/**
 * Adapter for an external query client (e.g. qortex-query / React Query).
 * Wire via `source.query`.
 */
export interface ExistingQuery<T = any> {
    data?: T;
    error?: unknown;
    status?: ResourceQueryStatus | "loading" | "pending";
    isLoading?: boolean;
    isFetching?: boolean;
    isStale?: boolean;
    updatedAt?: number;
    refetch?: () => Promise<T> | T;
    /** Notify the resource when external query state changes */
    subscribe?: (listener: () => void) => () => void;
}

/**
 * Adapter for an external mutation client.
 * Prefer `mutateAsync` when available.
 */
export interface ExistingMutation<T = any, R = any> {
    mutate?: (data: T) => void;
    mutateAsync?: (data: T) => Promise<R>;
    status?: MutationStatus | "pending";
    error?: unknown;
    data?: R;
    reset?: () => void;
}

/**
 * Adapter for an external store / atom.
 * Wire via `source.state`.
 */
export interface ExistingState<T = any> {
    get?: () => T | undefined;
    value?: T;
    set?: (value: T) => void;
    subscribe?: (listener: (value: T | undefined) => void) => () => void;
}

/**
 * Loose description of all possible source fields.
 * Prefer the constrained unions on `ResourceConfig` when configuring a resource.
 */
export interface ResourceSource<T = any, R = T> {
    /** Native async loader */
    fetch?: () => Promise<T> | T;
    /** Native async saver; receives draft + change meta */
    save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
    /** Bridge an existing query instance */
    query?: ExistingQuery<T>;
    /** Bridge an existing mutation instance */
    mutation?: ExistingMutation<T, R>;
    /** Bridge an existing store */
    state?: ExistingState<T>;
    /** Controlled value (pair with `onChange`) */
    value?: T;
    /** Called after a successful save when using controlled / state sources */
    onChange?: (value: T) => void;
}

/** Query behavior when using `source.fetch` (or bridged queries). */
export interface ResourceQueryConfig<T = any> {
    /** When false, skip automatic initial fetch. Default: true */
    enabled?: boolean;
    /** Milliseconds before cached data is considered stale. Default: 0 */
    staleTime?: number;
}

/** Mutation behavior for `save`. */
export interface ResourceMutationConfig<T = any, R = any> {
    /**
     * Apply draft to source immediately while saving.
     * Pass `true` to use the draft as-is, or a function to map draft → optimistic data.
     * On failure, source rolls back; draft overrides are kept.
     */
    optimistic?: boolean | ((draft: T, previous: T | undefined) => T);
}

/** Async key/value storage used by persist. */
export interface ResourceStorage {
    get<T = unknown>(key: string): Promise<T | undefined | null>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}

/** qortex-db–style storage adapter (`del` instead of `remove`). */
export interface ResourceDBStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    del(key: string): Promise<void>;
}

/** Persistence options for draft overrides and/or source cache. */
export interface ResourcePersistConfig {
    /** Persist unsaved draft overrides. Default: false unless `persist: true` */
    draft?: boolean;
    /** Persist last successful source payload. Default: false unless `persist: true` */
    cache?: boolean;
    /** Storage key segment; falls back to root `key` on the resource config */
    key?: string;
    /** Browser storage backend when no custom `storage` / `db` is provided */
    driver?: "localStorage" | "sessionStorage";
    /** Debounce for draft writes in ms. Default: 300 */
    debounce?: number;
    /** Custom storage adapter */
    storage?: ResourceStorage;
    /** qortex-db adapter (takes precedence over `driver`) */
    db?: ResourceDBStorage;
    /** Called when persistence read/write fails */
    onError?: (error: unknown) => void;
}

/**
 * Schema-style validator returning a flat path → message map.
 * Return `null` / `undefined` / `{}` when valid.
 */
export type ValidationResolver<T = any> = (
    data: T,
    context: { path?: string; mode: "field" | "form" },
) =>
    | Record<string, string | undefined>
    | null
    | undefined
    | Promise<Record<string, string | undefined> | null | undefined>;

/** Validation configuration for a resource. */
export interface ResourceValidationConfig<T = any> {
    /** When to auto-validate. Default behavior depends on call sites; typically `"blur"` or `"change"`. */
    on?: ValidationMode;
    /** Full-form / schema resolver (e.g. from `zodResolver`) */
    resolver?: ValidationResolver<T>;
    /**
     * Per-path validators. Keys support wildcards (`contacts.*.email`).
     * Return a string message, or null/undefined when valid.
     */
    fields?: Record<string, (value: any, data: T) => string | undefined | null | Promise<string | undefined | null>>;
}

/**
 * Core configuration options that are always valid regardless of data source.
 */
export interface ResourceBaseConfig<T, R = T> {
    /** Optional field definitions and read-only/editability controls */
    fields?: FieldsConfig;
    /** 
     * Determines whether field updates are restricted:
     * - `"open"` (default): Any path is editable unless explicitly marked readonly.
     * - `"strict"`: Only fields configured in `fields` with `editable: true` are editable.
     */
    fieldMode?: "open" | "strict";
    /** Resolver and field-level validation rules */
    validate?: ResourceValidationConfig<T>;
    /** Strategy for updating the draft when source data changes */
    sourceUpdate?: SourceUpdateMode;
    /** Event hook triggered on successful mutation save */
    onSaveSuccess?: (data: R) => void;
    /** Event hook triggered when save mutation encounters an error */
    onSaveError?: (error: unknown) => void;
}

/**
 * Union type constraining valid combinations of source configurations and lifecycle rules.
 */
export type ResourceSourceConfigUnion<T, R = T> =
    | {
          /** Client-only state. No query operations are configured. */
          source?: undefined;
          /** Local initial data or function/promise returning initial data */
          initialData?: T | (() => T) | (() => Promise<T>);
          query?: undefined;
          mutation?: undefined;
      }
    | {
          /** Native asynchronous fetch and save config */
          source: {
              /** Fetch data asynchronously */
              fetch?: () => Promise<T> | T;
              /** Save data mutations asynchronously */
              save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
              /** Integrated mutation state bridge */
              mutation?: ExistingMutation<T, R>;
          };
          /** Local initial data before async fetch completes */
          initialData?: T | (() => T);
          /** Fetching/query configuration rules (staleTime, equalityFn, etc.) */
          query?: ResourceQueryConfig<T>;
          /** Save/mutation configuration rules (optimistic updates) */
          mutation?: ResourceMutationConfig<T, R>;
      }
    | {
          /** Integrated query bridge using an external ExistingQuery instance */
          source: {
              /** Synchronize with an existing query instance (e.g. from react-query or qortex-query) */
              query: ExistingQuery<T>;
              /** Save data mutations asynchronously */
              save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
              /** Integrated mutation state bridge */
              mutation?: ExistingMutation<T, R>;
          };
          initialData?: undefined;
          /** Fetching/query configuration rules (staleTime, equalityFn, etc.) */
          query?: ResourceQueryConfig<T>;
          /** Save/mutation configuration rules (optimistic updates) */
          mutation?: ResourceMutationConfig<T, R>;
      }
    | {
          /** Integrated state synchronization using an external store or state instance */
          source: {
              /** Synchronize with an existing state instance (e.g. from qortex-store) */
              state: ExistingState<T>;
              /** Save data mutations asynchronously */
              save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
              /** Integrated mutation state bridge */
              mutation?: ExistingMutation<T, R>;
          };
          initialData?: undefined;
          query?: undefined;
          /** Save/mutation configuration rules (optimistic updates) */
          mutation?: ResourceMutationConfig<T, R>;
      }
    | {
          /** Controlled-value component state synchronization */
          source: {
              /** The current value representing the source data */
              value: T;
              /** Callback triggered whenever a field change is committed */
              onChange?: (value: T) => void;
              /** Save data mutations asynchronously */
              save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
              /** Integrated mutation state bridge */
              mutation?: ExistingMutation<T, R>;
          };
          initialData?: undefined;
          query?: undefined;
          /** Save/mutation configuration rules (optimistic updates) */
          mutation?: ResourceMutationConfig<T, R>;
      };

/**
 * Union type constraining valid persistence configuration structures (enforces keys when persistence is enabled).
 */
export type ResourcePersistConfigUnion =
    | {
          /** Storage/persistence setup is disabled */
          persist?: false;
          /** Optional unique cache key */
          key?: ResourceKey;
      }
    | {
          /** Storage/persistence setup for caching or unsaved draft states (enforces root-level key) */
          persist: true | Omit<ResourcePersistConfig, "key">;
          /** Unique cache key required for persistence */
          key: ResourceKey;
      }
    | {
          /** Storage/persistence setup specifying a key directly in persist configuration */
          persist: ResourcePersistConfig & { key: string };
          /** Optional cache key */
          key?: ResourceKey;
      };

/**
 * Configuration options for `createResource()`, typed to prevent conflicting configs.
 */
export type ResourceConfig<T, R = T> = ResourceBaseConfig<T, R> &
    ResourceSourceConfigUnion<T, R> &
    ResourcePersistConfigUnion;

/**
 * Represents the fetching/query state of a Resource.
 */
export interface ResourceQuery<T = any> {
    /** The original/source server data fetched */
    readonly data: T | undefined;
    /** Fetch/query error if the operation failed */
    readonly error: unknown;
    /** Current status of the query lifecycle */
    readonly status: ResourceQueryStatus;
    /** True if fetching the query for the first time */
    readonly isLoading: boolean;
    /** True if currently fetching data (both initial load and refetches) */
    readonly isFetching: boolean;
    /** True if the data is marked as stale and needs refetching */
    readonly isStale: boolean;
    /** Epoch timestamp of when data was last successfully fetched */
    readonly updatedAt: number | undefined;
    /** Trigger a fetch request */
    fetch(): Promise<T | undefined>;
    /** Trigger a refetch of source data, ignoring stale checks */
    refetch(): Promise<T | undefined>;
    /** Mark cache data as stale */
    invalidate(): void;
    /** Dynamically enable or disable automatic query fetching */
    setEnabled(enabled: boolean): void;
    /** Update cache stale lifetime configuration */
    setStaleTime(staleTime: number): void;
}

/**
 * Represents the save/mutation state of a Resource.
 */
export interface ResourceMutation<R = any> {
    /** Current status of the save operation */
    readonly status: MutationStatus;
    /** Error details if save mutation fails */
    readonly error: unknown;
    /** The response data returned from a successful save mutation */
    readonly data: R | undefined;
    /** True if the mutation save is currently in progress */
    readonly isSaving: boolean;
    /** Reset the mutation state back to idle */
    reset(): void;
    /** Retry the last attempted save mutation */
    retry(): Promise<MutationResult<R>>;
}

/**
 * Controller for getting and setting properties of a single field.
 */
export interface FieldController<V = any> {
    /** Dot-notation path of the field */
    readonly path: string;
    /** Current value of the field (draft override or original data) */
    readonly value: V;
    /** Initial value of the field before edits */
    readonly initialValue: V;
    /** True if field's current value has changed from its initial value */
    readonly isChanged: boolean;
    /** True if the field has been blurred/touched by the user */
    readonly isTouched: boolean;
    /** Validation error message for this specific field */
    readonly error: string | undefined;
    /** Update the field's draft value */
    set(value: V | ((prev: V) => V)): void;
    /** Reset the field value and metadata back to its initial state */
    reset(): void;
    /** Mark the field as blurred/touched */
    touch(): void;
    /** Validate this specific field */
    validate(): Promise<FieldValidationResult>;
}

/**
 * Stable identity entry for an item in an array field.
 */
export interface ArrayFieldEntry<T = any> {
    /** Stable identity key for React lists (survives reorder) */
    readonly id: string;
    /** Current index in the array */
    readonly index: number;
    /** The item value at this index */
    readonly item: T;
}

/**
 * Array controller subclass offering helper methods for list operations.
 */
export interface ArrayFieldController<T = any> extends FieldController<T[]> {
    /** The array items contained within this field */
    readonly items: T[];
    /** Items with stable identity keys for list rendering */
    readonly fields: ArrayFieldEntry<T>[];
    /** Append an item to the end of the array list */
    append(item: T): void;
    /** Prepend an item to the start of the array list */
    prepend(item: T): void;
    /** Insert an item at a specific index */
    insert(index: number, item: T): void;
    /** Remove an item at a specific index */
    remove(index: number): void;
    /** Swap the positions of two items in the array list */
    swap(indexA: number, indexB: number): void;
    /** Move an item from one index to another */
    move(from: number, to: number): void;
}

/**
 * Read-only snapshot of the complete resource state.
 */
export interface ResourceSnapshot<T, R = any> {
    /** The original fetched/synchronized server data */
    readonly data: T | undefined;
    /** The current state of the data including all local modifications */
    readonly draft: T | undefined;
    /** Overall status of the resource ("idle" | "loading" | "ready" | "error") */
    readonly status: ResourceStatus;
    /** Source query fetch error, if any */
    readonly error: unknown;
    /** Detailed query fetching state object */
    readonly query: ResourceQuery<T>;
    /** Detailed save/mutation state object */
    readonly mutation: ResourceMutation<R>;
    /** True if currently loading initial data */
    readonly isLoading: boolean;
    /** True if currently fetching query data in the background */
    readonly isFetching: boolean;
    /** True if save/mutation operation is currently in progress */
    readonly isSaving: boolean;
    /** True if the draft contains unsaved changes relative to source data */
    readonly isChanged: boolean;
    /** True if there are currently no validation errors */
    readonly isValid: boolean;
    /** True if resource query or mutation failed */
    readonly isError: boolean;
    /**
     * Dot-notation paths with explicit draft overrides.
     * A nested leaf can be visually changed via an ancestor override without
     * appearing here — use `field(path).isChanged` for per-path draft vs data.
     */
    readonly changedFields: string[];
    /** List of dot-notation paths representing touched/blurred fields */
    readonly touchedFields: string[];
    /** Record of current validation errors mapping path to error message */
    readonly errors: Record<string, string>;
}

/**
 * A Resource instance managing state, query operations, and mutations.
 */
export interface Resource<T, R = any> extends ResourceSnapshot<T, R> {
    /** Get a read-only snapshot of the current state */
    readonly snapshot: ResourceSnapshot<T, R>;
    /** Get a single field controller by typed path */
    field<P extends PathOf<T>>(path: P): FieldController<PathValue<T, P>>;
    /** Get a single field controller by dynamic string path */
    field<V = any>(path: string): FieldController<V>;
    /**
     * Stable plain field snapshot for React `useSyncExternalStore` getSnapshot.
     * Referentially equal when value/meta are unchanged.
     */
    getFieldState<V = any>(path: string): FieldState<V>;
    /** Get an array list field controller by typed path */
    array<P extends PathOf<T>>(path: P): ArrayFieldController<PathValue<T, P> extends readonly (infer I)[] ? I : any>;
    /** Get an array list field controller by dynamic string path */
    array<I = any>(path: string): ArrayFieldController<I>;
    /** Get the current draft value of a typed path */
    get<P extends PathOf<T>>(path: P): PathValue<T, P>;
    /** Get the current draft value of a dynamic path */
    get<V = any>(path: string): V;
    /** Get the initial value of a typed path */
    getInitial<P extends PathOf<T>>(path: P): PathValue<T, P>;
    /** Get the initial value of a dynamic path */
    getInitial<V = any>(path: string): V;
    /** Modify a draft value at a typed path */
    set<P extends PathOf<T>>(
        path: P,
        value: PathValue<T, P> | ((prev: PathValue<T, P>) => PathValue<T, P>),
    ): void;
    /** Modify a draft value at a dynamic path */
    set(path: string, value: any | ((prev: any) => any)): void;
    /** Batch edit multiple draft paths at once */
    setMany(patches: Record<string, any>): void;
    /** Reset the draft override at a path */
    reset(path: string): void;
    /** Clear all local draft edits, reverting to source data */
    resetDraft(): void;
    /** Mark a path as touched/blurred */
    touch(path: string): void;
    /** Declaratively fetch source data */
    fetch(): Promise<T | undefined>;
    /** Force refetch data, bypassing cache configuration */
    refetch(): Promise<T | undefined>;
    /** Save all local draft modifications using source.save */
    save(): Promise<MutationResult<R>>;
    /** Run validation resolver and field checks for the entire resource */
    validate(): Promise<boolean>;
    /** Run validation for a single field path */
    validateField(path: string): Promise<FieldValidationResult>;
    /** Run validation for multiple path targets or pattern wildcards */
    validateFields(paths: string[] | string): Promise<ValidationResult>;
    /** Subscribe to overall resource state changes */
    subscribe(listener: (snapshot: ResourceSnapshot<T, R>) => void): () => void;
    /** Subscribe to state changes of a single field controller */
    subscribeField(path: string, listener: (field: FieldController) => void): () => void;
    /** Synchronously apply server data updates to the resource */
    syncSource(source: ExistingQuery<T> | ExistingState<T> | { data?: T; value?: T }): void;
    /** Destroy subscriptions, timers, and perform cleanup */
    destroy(): void;
}
