import { FieldState, FieldsConfig } from "./field";
import { Plugin } from "./plugin";

/** Overall resource status */
export type ResourceStatus = "idle" | "loading" | "ready" | "error";

/** Mutation lifecycle status */
export type MutationStatus = "idle" | "mutating" | "success" | "error";

/**
 * Metadata provided to the mutate function.
 */
export interface MutateMeta {
    /** List of field paths that have changed */
    changedFields: string[];
    /** Whether any field has changed */
    isChanged: boolean;
}

/**
 * Result returned by `mutateAsync()`.
 */
export interface MutationResult<R = any> {
    /** Whether the mutation succeeded */
    success: boolean;
    /** Return value from the mutate function (on success) */
    data: R | undefined;
    /** Error thrown by the mutate function (on failure) */
    error: unknown;
}

/**
 * Complete snapshot of a resource's current state.
 * Returned by `resource.get()` and provided to subscribers.
 */
export interface ResourceSnapshot<T> {
    /** Initial/server data (unmodified) */
    data: T | undefined;
    /** Data with user edits applied */
    updatedData: T;
    /** Overall resource status */
    status: ResourceStatus;
    /** Whether initial data is loading */
    isLoading: boolean;
    /** Whether any field has changed */
    isChanged: boolean;
    /** Whether all validations pass */
    isValid: boolean;
    /** Whether a mutation is in progress */
    isMutating: boolean;
    /** List of changed field paths */
    changedFields: string[];
    /** List of touched field paths */
    touchedFields: string[];
    /** Map of field path → error message */
    errors: Record<string, string>;

    /** Mutation lifecycle status */
    mutationStatus: MutationStatus;
    /** Last mutation error */
    mutationError: unknown;
    /** Last successful mutation return value */
    mutationData: any;
}

/**
 * Configuration for `createResource()`.
 *
 * @template T - The data type
 */
export interface ResourceConfig<T> {
    /**
     * Initial data for the resource.
     * Can be:
     * - A static object
     * - A sync function that returns data
     * - An async function that returns a Promise
     */
    initialData?: T | (() => T) | (() => Promise<T>);

    /**
     * Field configuration.
     * Supports flat dot-notation, nested objects, or mixed.
     */
    fields?: FieldsConfig;

    /**
     * Mutation function called when the user submits changes.
     * Receives the initial data, updated data, and metadata.
     */
    mutate?: (
        initialData: T | undefined,
        updatedData: T,
        meta: MutateMeta,
    ) => Promise<any> | any;

    /** Callback fired on successful mutation */
    onMutateSuccess?: (data: any) => void;
    /** Callback fired on failed mutation */
    onMutateError?: (error: unknown) => void;

    /** Plugins to extend resource behavior */
    plugins?: Plugin<T>[];
}

/**
 * A resource instance returned by `createResource()`.
 * Provides methods to read, edit, validate, and sync data.
 *
 * @template T - The data type
 */
export interface Resource<T> {
    // ── Read ──
    /** Get the full resource snapshot */
    get(): ResourceSnapshot<T>;
    /** Get the initial/server data (unmodified) */
    getData(): T | undefined;
    /** Get data with user edits merged */
    getUpdatedData(): T;
    /** Get the state of a specific field */
    getField(path: string): FieldState;

    // ── Write ──
    /** Set a field value (direct or functional update) */
    setField(path: string, value: any | ((prev: any) => any)): void;
    /** Set multiple fields at once */
    setFields(patches: Record<string, any>): void;
    /** Reset a field to its initial value */
    resetField(path: string): void;
    /** Reset all fields to initial values */
    resetAll(): void;
    /** Manually set the initial data */
    setInitialData(data: T): void;

    // ── Lifecycle ──
    /** Overall resource status */
    readonly status: ResourceStatus;
    /** Whether any field has changed */
    readonly isChanged: boolean;
    /** Whether all validations pass */
    readonly isValid: boolean;
    /** Whether a mutation is in progress */
    readonly isMutating: boolean;
    /** Whether initial data is loading */
    readonly isLoading: boolean;
    /** List of changed field paths */
    readonly changedFields: string[];
    /** List of touched field paths */
    readonly touchedFields: string[];
    /** Map of field path → error message */
    readonly errors: Record<string, string>;

    // ── Mutation ──
    /** Fire-and-forget mutation (errors tracked in state) */
    mutate(): void;
    /** Async mutation that returns result */
    mutateAsync(): Promise<MutationResult>;
    /** Run validation only (populate errors) */
    validate(): Promise<boolean>;
    /** Mutation lifecycle status */
    readonly mutationStatus: MutationStatus;
    /** Last mutation error */
    readonly mutationError: unknown;
    /** Last successful mutation return value */
    readonly mutationData: any;

    // ── Reactivity ──
    /** Subscribe to all state changes */
    subscribe(listener: (snapshot: ResourceSnapshot<T>) => void): () => void;
    /** Subscribe to a specific field's changes (supports nested paths) */
    subscribeField(path: string, listener: (state: FieldState) => void): () => void;
    /** Notify plugins of a field blur event */
    touchField(path: string): void;
    /** Clean up all subscriptions and plugin resources */
    destroy(): void;
}
