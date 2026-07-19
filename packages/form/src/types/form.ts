import { FieldState, FieldsConfig } from "./field";
import type { PathOf, PathValue } from "./path";

type Key = string | number | boolean | null | undefined;

/** Persist identity. Prefer a stable string or tuple (e.g. `["user", id]`). */
export type FormKey = Key | readonly Key[];

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
 * - `"replaceAll"` — same as resetDraft (full replace)
 */
export type SourceUpdateMode = "keepDirty" | "resetDraft" | "replaceAll";

/** Metadata passed to save mutators. */
export interface MutateMeta {
    /** Paths with explicit draft overrides */
    changedFields: string[];
    /** True when there is at least one override */
    isChanged: boolean;
}

/** Result of `form.save(mutator)`. */
export interface SaveResult {
    success: boolean;
    error?: unknown;
}

/** Mutator invoked by `form.save`. Does not update form `data`. */
export type FormMutator<T> = (draft: T, meta: MutateMeta) => Promise<unknown> | unknown;

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

/** Async key/value storage used by persist. */
export interface FormStorage {
    get<T = unknown>(key: string): Promise<T | undefined | null>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}

/** qortex-db–style storage adapter (`del` instead of `remove`). */
export interface FormDBStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    del(key: string): Promise<void>;
}

/** Persistence options for draft overrides and/or source cache. */
export interface FormPersistConfig {
    /** Persist unsaved draft overrides. Default: false unless `persist: true` */
    draft?: boolean;
    /** Persist last source payload for hydrate when `data` is undefined. Default: false unless `persist: true` */
    cache?: boolean;
    /** Storage key segment; falls back to root `key` on the form config */
    key?: string;
    /** Browser storage backend when no custom `storage` / `db` is provided */
    driver?: "localStorage" | "sessionStorage";
    /** Debounce for draft writes in ms. Default: 300 */
    debounce?: number;
    /** Custom storage adapter */
    storage?: FormStorage;
    /** qortex-db adapter (takes precedence over `driver`) */
    db?: FormDBStorage;
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

/** Validation configuration for a form. */
export interface FormValidationConfig<T = any> {
    /** When to auto-validate */
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
 * Union type constraining valid persistence configuration structures.
 */
export type FormPersistConfigUnion =
    | {
          persist?: false;
          key?: FormKey;
      }
    | {
          persist: true | Omit<FormPersistConfig, "key">;
          key: FormKey;
      }
    | {
          persist: FormPersistConfig & { key: string };
          key?: FormKey;
      };

/**
 * Configuration options for `createForm()`.
 */
export type FormConfig<T> = FormPersistConfigUnion & {
    /** External/source data (synced via `setData` when it changes) */
    data?: T;
    /** Sync initial data when `data` is not provided */
    initialData?: T | (() => T);
    /** Optional field definitions and read-only/editability controls */
    fields?: FieldsConfig;
    /**
     * - `"open"` (default): Any path is editable unless explicitly marked readonly.
     * - `"strict"`: Only fields configured in `fields` with `editable: true` are editable.
     */
    fieldMode?: "open" | "strict";
    /** Resolver and field-level validation rules */
    validate?: FormValidationConfig<T>;
    /** Strategy for updating the draft when source data changes */
    sourceUpdate?: SourceUpdateMode;
    /** Called after a successful save mutator */
    onSaveSuccess?: (result?: unknown) => void;
    /** Called when save mutator throws */
    onSaveError?: (error: unknown) => void;
};

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
 * Read-only snapshot of the complete form state.
 */
export interface FormSnapshot<T> {
    /** The original/source data */
    readonly data: T | undefined;
    /** The current state including all local modifications */
    readonly draft: T | undefined;
    /** True if the draft contains unsaved changes relative to source data */
    readonly isChanged: boolean;
    /** True if there are currently no validation errors */
    readonly isValid: boolean;
    /**
     * Dot-notation paths with explicit draft overrides.
     * A nested leaf can be visually changed via an ancestor override without
     * appearing here — use `field(path).isChanged` for per-path draft vs data.
     */
    readonly changedFields: string[];
    /** List of dot-notation paths representing touched/blurred fields */
    readonly touchedFields: string[];
    /** Record of current validation errors mapping path to error message */
    readonly fieldErrors: Record<string, string>;
    /** Alias for {@link fieldErrors} */
    readonly errors: Record<string, string>;
}

/**
 * A Form instance managing draft edits, validation, and save.
 */
export interface Form<T> extends FormSnapshot<T> {
    /** Get a read-only snapshot of the current state */
    readonly snapshot: FormSnapshot<T>;
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
    /**
     * Validate, then run mutator. On success: resetDraft + clearPersistedDraft.
     * Does not apply mutator result as `data`.
     */
    save(mutator: FormMutator<T>): Promise<SaveResult>;
    /** Run validation resolver and field checks for the entire form */
    validate(): Promise<boolean>;
    /** Run validation for a single field path */
    validateField(path: string): Promise<FieldValidationResult>;
    /** Run validation for multiple path targets or pattern wildcards */
    validateFields(paths: string[] | string): Promise<ValidationResult>;
    /** Sync external source data (e.g. when React `config.data` changes) */
    setData(data: T | undefined): void;
    /** Subscribe to overall form state changes */
    subscribe(listener: (snapshot: FormSnapshot<T>) => void): () => void;
    /** Subscribe to state changes of a single field controller */
    subscribeField(path: string, listener: (field: FieldController) => void): () => void;
    /** Destroy subscriptions, timers, and perform cleanup */
    destroy(): void;
}
