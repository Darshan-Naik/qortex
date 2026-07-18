import { FieldsConfig } from "./field";
import { Plugin } from "./plugin";

type Key = string | number | boolean | null | undefined;

export type ResourceKey = Key | readonly Key[];
export type ResourceStatus = "idle" | "loading" | "ready" | "error";
export type MutationStatus = "idle" | "mutating" | "success" | "error";
export type ResourceQueryStatus = "idle" | "fetching" | "success" | "error";
export type ValidationMode = "change" | "blur" | "submit" | "manual";
export type SourceUpdateMode = "keepDirty" | "resetDraft" | "replaceAll";

export interface MutateMeta {
    changedFields: string[];
    isChanged: boolean;
}

export interface MutationResult<R = any> {
    success: boolean;
    data: R | undefined;
    error: unknown;
}

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string | undefined>;
}

export interface FieldValidationResult {
    path: string;
    valid: boolean;
    error: string | undefined;
}

export interface ExistingQuery<T = any> {
    data?: T;
    error?: unknown;
    status?: ResourceQueryStatus | "loading" | "pending";
    isLoading?: boolean;
    isFetching?: boolean;
    isStale?: boolean;
    updatedAt?: number;
    refetch?: () => Promise<T> | T;
    subscribe?: (listener: () => void) => () => void;
}

export interface ExistingMutation<T = any, R = any> {
    mutate?: (data: T) => void;
    mutateAsync?: (data: T) => Promise<R>;
    status?: MutationStatus | "pending";
    error?: unknown;
    data?: R;
    reset?: () => void;
}

export interface ExistingState<T = any> {
    get?: () => T | undefined;
    value?: T;
    set?: (value: T) => void;
    subscribe?: (listener: (value: T | undefined) => void) => () => void;
}

export interface ResourceSource<T = any, R = T> {
    fetch?: () => Promise<T> | T;
    save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
    query?: ExistingQuery<T>;
    mutation?: ExistingMutation<T, R>;
    state?: ExistingState<T>;
    value?: T;
    onChange?: (value: T) => void;
}

export interface ResourceQueryConfig<T = any> {
    enabled?: boolean;
    staleTime?: number;
    placeholderData?: T;
    equalityFn?: (a: T | undefined, b: T | undefined) => boolean;
}

export interface ResourceMutationConfig<T = any, R = any> {
    optimistic?: boolean | ((draft: T, previous: T | undefined) => T);
    updateSource?: boolean | ((result: R, previous: T | undefined) => T);
}

export interface ResourceStorage {
    get<T = unknown>(key: string): Promise<T | undefined | null>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}

export interface ResourceDBStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    del(key: string): Promise<void>;
}

export interface ResourcePersistConfig {
    draft?: boolean;
    cache?: boolean;
    key?: string;
    driver?: "localStorage" | "sessionStorage";
    debounce?: number;
    storage?: ResourceStorage;
    db?: ResourceDBStorage;
    onError?: (error: unknown) => void;
}

export type ValidationResolver<T = any> = (
    data: T,
    context: { path?: string; mode: "field" | "form" },
) =>
    | Record<string, string | undefined>
    | null
    | undefined
    | Promise<Record<string, string | undefined> | null | undefined>;

export interface ResourceValidationConfig<T = any> {
    on?: ValidationMode;
    resolver?: ValidationResolver<T>;
    fields?: Record<string, (value: any, data: T) => string | undefined | null | Promise<string | undefined | null>>;
}

export interface ResourceConfig<T, R = T> {
    key?: ResourceKey;
    initialData?: T | (() => T) | (() => Promise<T>);
    source?: ResourceSource<T, R>;
    fields?: FieldsConfig;
    fieldMode?: "open" | "strict";
    query?: ResourceQueryConfig<T>;
    mutation?: ResourceMutationConfig<T, R>;
    persist?: ResourcePersistConfig | boolean;
    validate?: ResourceValidationConfig<T>;
    sourceUpdate?: SourceUpdateMode;
    onSaveSuccess?: (data: R) => void;
    onSaveError?: (error: unknown) => void;
    plugins?: Plugin<T>[];
}

export interface ResourceQuery<T = any> {
    readonly data: T | undefined;
    readonly error: unknown;
    readonly status: ResourceQueryStatus;
    readonly isLoading: boolean;
    readonly isFetching: boolean;
    readonly isStale: boolean;
    readonly updatedAt: number | undefined;
    fetch(): Promise<T | undefined>;
    refetch(): Promise<T | undefined>;
    invalidate(): void;
    setEnabled(enabled: boolean): void;
    setStaleTime(staleTime: number): void;
}

export interface ResourceMutation<R = any> {
    readonly status: MutationStatus;
    readonly error: unknown;
    readonly data: R | undefined;
    readonly isSaving: boolean;
    reset(): void;
    retry(): Promise<MutationResult<R>>;
}

export interface FieldController<V = any> {
    readonly path: string;
    readonly value: V;
    readonly initialValue: V;
    readonly isChanged: boolean;
    readonly isTouched: boolean;
    readonly error: string | undefined;
    set(value: V | ((prev: V) => V)): void;
    reset(): void;
    touch(): void;
    validate(): Promise<FieldValidationResult>;
}

export interface ArrayFieldController<T = any> extends FieldController<T[]> {
    readonly items: T[];
    append(item: T): void;
    prepend(item: T): void;
    insert(index: number, item: T): void;
    remove(index: number): void;
    swap(indexA: number, indexB: number): void;
    move(from: number, to: number): void;
}

export interface ResourceSnapshot<T, R = any> {
    readonly data: T | undefined;
    readonly draft: T | undefined;
    readonly status: ResourceStatus;
    readonly error: unknown;
    readonly query: ResourceQuery<T>;
    readonly mutation: ResourceMutation<R>;
    readonly isLoading: boolean;
    readonly isFetching: boolean;
    readonly isSaving: boolean;
    readonly isChanged: boolean;
    readonly isValid: boolean;
    readonly isError: boolean;
    readonly changedFields: string[];
    readonly touchedFields: string[];
    readonly errors: Record<string, string>;
}

export interface Resource<T, R = any> extends ResourceSnapshot<T, R> {
    readonly snapshot: ResourceSnapshot<T, R>;
    field<V = any>(path: string): FieldController<V>;
    array<I = any>(path: string): ArrayFieldController<I>;
    get<V = any>(path: string): V;
    getInitial<V = any>(path: string): V;
    set(path: string, value: any | ((prev: any) => any)): void;
    setMany(patches: Record<string, any>): void;
    reset(path: string): void;
    resetDraft(): void;
    touch(path: string): void;
    fetch(): Promise<T | undefined>;
    refetch(): Promise<T | undefined>;
    save(): Promise<MutationResult<R>>;
    validate(): Promise<boolean>;
    validateField(path: string): Promise<FieldValidationResult>;
    validateFields(paths: string[] | string): Promise<ValidationResult>;
    subscribe(listener: (snapshot: ResourceSnapshot<T, R>) => void): () => void;
    subscribeField(path: string, listener: (field: FieldController) => void): () => void;
    syncSource(source: ExistingQuery<T> | ExistingState<T> | { data?: T; value?: T }): void;
    destroy(): void;
}
