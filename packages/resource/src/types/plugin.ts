import { FieldMeta } from "./field";
import { ResourceSnapshot, ResourceStatus } from "./resource";

/**
 * Context provided to plugins.
 * Gives plugins access to read/write resource state.
 */
export interface PluginContext<T = any> {
    /** Get the current initial/server data */
    getData(): T | undefined;
    /** Get data with user edits merged */
    getUpdatedData(): T;
    /** Get the draft overrides map */
    getDraftOverrides(): Map<string, any>;
    /** Manually set the initial data (e.g., from query fetch) */
    setInitialData(data: T): void;
    /** Reset all draft overrides */
    resetDrafts(): void;
    /** Set a validation error on a field */
    setFieldError(path: string, error: string | undefined): void;
    /** Set validation errors for multiple fields */
    setFieldErrors(errors: Record<string, string | undefined>): void;
    /** Get metadata for a field */
    getFieldMeta(path: string): FieldMeta;
    /** Set the resource status */
    setStatus(status: ResourceStatus): void;
    /** Set an error on the resource */
    setError(error: unknown): void;
    /** Subscribe to resource state changes */
    subscribe(listener: (snapshot: ResourceSnapshot<T>) => void): () => void;
}

/**
 * Plugin interface for extending resource behavior.
 * All lifecycle hooks are optional.
 *
 * @template T - The resource data type
 */
export interface Plugin<T = any> {
    /** Unique plugin name (for debugging) */
    name: string;
    /** Called when the resource is created. Return a cleanup function. */
    onInit?(ctx: PluginContext<T>): void | (() => void);
    /** Called when initial/server data is set or updated */
    onInitialData?(data: T, ctx: PluginContext<T>): void;
    /** Called when a field value changes */
    onFieldChange?(path: string, value: any, ctx: PluginContext<T>): void;
    /** Called when a field loses focus */
    onFieldBlur?(path: string, ctx: PluginContext<T>): void;
    /** Called before mutation. Return false, sync or async, to abort. */
    onBeforeMutate?(updatedData: T, ctx: PluginContext<T>): boolean | void | Promise<boolean | void>;
    /** Called after successful mutation */
    onAfterMutate?(result: any, ctx: PluginContext<T>): void;
    /** Called when mutation fails */
    onMutateError?(error: unknown, ctx: PluginContext<T>): void;
}
