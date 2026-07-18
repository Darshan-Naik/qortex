import type {
    ArrayFieldController,
    ExistingQuery,
    ExistingState,
    FieldController,
    FieldValidationResult,
    MutationResult,
    MutationStatus,
    Plugin,
    PluginContext,
    Resource,
    ResourceConfig,
    ResourceMutation,
    ResourceQuery,
    ResourceQueryStatus,
    ResourceSnapshot,
    ResourceStatus,
    ResourceStorage,
    ValidationResult,
} from "./types";
import { FieldConfig } from "./types";
import { flattenFieldsConfig, isEditable } from "./field";
import { applyOverrides, diffPaths, getByPath, setByPath } from "./path";

type FieldListener = (field: FieldController) => void;

type FieldMeta = {
    touched: boolean;
    error: string | undefined;
};

export function createResource<T, R = T>(config: ResourceConfig<T, R>): Resource<T, R> {
    return new ResourceCore(config).api;
}

class ResourceCore<T, R = T> {
    api: Resource<T, R>;

    private dataValue: T | undefined;
    private statusValue: ResourceStatus = "idle";
    private errorValue: unknown = undefined;
    private updatedAt: number | undefined = undefined;
    private isStaleValue = false;
    private queryEnabled: boolean;
    private staleTime: number;
    private draftOverrides = new Map<string, any>();
    private meta = new Map<string, FieldMeta>();
    private listeners = new Set<(snapshot: ResourceSnapshot<T, R>) => void>();
    private fieldListeners = new Map<string, Set<FieldListener>>();
    private cleanups: Array<() => void> = [];
    private mutationStatusValue: MutationStatus = "idle";
    private mutationErrorValue: unknown = undefined;
    private mutationDataValue: R | undefined = undefined;
    private lastSave: (() => Promise<MutationResult<R>>) | undefined;
    private fieldConfigs: Map<string, FieldConfig>;
    private snapshotCache: ResourceSnapshot<T, R> | undefined;
    private persistTimer: ReturnType<typeof setTimeout> | undefined;
    private storage: ResourceStorage | undefined;
    private persistKey: string;
    private pluginCleanups: Array<() => void> = [];
    private pluginContext: PluginContext<T>;
    private pluginsInitialized = false;
    private fieldControllers = new Map<string, FieldController>();
    private fieldStates = new Map<string, any>();

    constructor(private config: ResourceConfig<T, R>) {
        this.queryEnabled = config.query?.enabled !== false;
        this.staleTime = config.query?.staleTime ?? 0;
        this.fieldConfigs = flattenFieldsConfig(config.fields);
        this.persistKey = getPersistKey(config);
        this.storage = createStorage(config.persist);
        this.pluginContext = this.createPluginContext();
        
        // Load synchronous source data first
        this.initializeSource();
        // Run plugin onInit hooks
        this.initializePlugins();
        
        // Notify plugins of the initial sync data
        this.pluginsInitialized = true;
        if (this.dataValue !== undefined) {
            for (const plugin of this.config.plugins ?? []) {
                plugin.onInitialData?.(this.dataValue, this.pluginContext);
            }
        }

        this.api = this.createApi();

        this.initialize();
    }

    private async initialize(): Promise<void> {
        this.hydrateCache();
        this.hydrateDraft();

        if (this.config.source?.fetch && this.queryEnabled) {
            this.fetch();
        }
    }

    private initializeSource(): void {
        const source = this.config.source;

        if (source?.query) {
            this.applyQuery(source.query);
            if (source.query.subscribe) {
                this.cleanups.push(source.query.subscribe(() => this.applyQuery(source.query!)));
            }
            return;
        }

        if (source?.state) {
            this.applySourceValue(readState(source.state));
            if (source.state.subscribe) {
                this.cleanups.push(source.state.subscribe((value) => this.applySourceValue(value)));
            }
            return;
        }

        if ("value" in (source ?? {})) {
            this.applySourceValue(source?.value);
            return;
        }

        if (this.config.initialData !== undefined) {
            const initial = typeof this.config.initialData === "function"
                ? (this.config.initialData as Function)()
                : this.config.initialData;

            if (isPromiseLike(initial)) {
                this.statusValue = "loading";
                initial
                    .then((value: T) => this.applySourceValue(value, "resetDraft"))
                    .catch((error: unknown) => {
                        this.errorValue = error;
                        this.statusValue = "error";
                        this.emit();
                    });
            } else {
                this.applySourceValue(initial as T, "resetDraft");
            }
        }
    }

    private applyQuery(query: ExistingQuery<T>): void {
        if (query.data !== undefined) {
            this.applySourceValue(query.data);
        }

        this.errorValue = query.error;
        this.statusValue = normalizeResourceStatus(query);
        this.updatedAt = query.updatedAt ?? this.updatedAt;
        this.isStaleValue = query.isStale ?? this.isStaleValue;
        this.emit();
    }

    private applySourceValue(value: T | undefined, mode = this.config.sourceUpdate ?? "keepDirty"): void {
        const previousData = this.dataValue;
        this.dataValue = value;
        this.updatedAt = value === undefined ? this.updatedAt : Date.now();
        this.statusValue = value === undefined ? this.statusValue : "ready";
        this.errorValue = undefined;

        if (mode === "resetDraft" || previousData === undefined) {
            this.draftOverrides.clear();
        } else if (mode === "replaceAll") {
            this.draftOverrides.clear();
        }

        if (value !== undefined && this.pluginsInitialized) {
            for (const plugin of this.config.plugins ?? []) {
                plugin.onInitialData?.(value, this.pluginContext);
            }
        }

        this.emitAllFields();
        this.emit();
    }

    private createApi(): Resource<T, R> {
        const core = this;

        return {
            get data() { return core.dataValue; },
            get draft() { return core.draft; },
            get status() { return core.statusValue; },
            get error() { return core.errorValue; },
            get query() { return core.queryApi; },
            get mutation() { return core.mutationApi; },
            get isLoading() { return core.statusValue === "loading"; },
            get isFetching() { return core.queryApi.isFetching; },
            get isSaving() { return core.mutationStatusValue === "mutating"; },
            get isChanged() { return core.changedFields.length > 0; },
            get isValid() { return Object.keys(core.errors).length === 0; },
            get changedFields() { return core.changedFields; },
            get touchedFields() { return core.touchedFields; },
            get errors() { return core.errors; },
            field: core.field,
            array: core.array,
            get: core.get,
            getInitial: core.getInitial,
            set: core.set,
            setMany: core.setMany,
            reset: core.reset,
            resetDraft: core.resetDraft,
            touch: core.touch,
            fetch: core.fetch,
            refetch: core.refetch,
            save: core.save,
            validate: core.validate,
            validateField: core.validateField,
            validateFields: core.validateFields,
            subscribe: core.subscribe,
            subscribeField: core.subscribeField,
            get snapshot() { return core.snapshot; },
            syncSource: core.syncSource,
            destroy: core.destroy,
        };
    }

    private get snapshot(): ResourceSnapshot<T, R> {
        if (!this.snapshotCache) {
            this.snapshotCache = {
                data: this.dataValue,
                draft: this.draft,
                status: this.statusValue,
                error: this.errorValue,
                query: this.queryApi,
                mutation: this.mutationApi,
                isLoading: this.statusValue === "loading",
                isFetching: this.queryApi.isFetching,
                isSaving: this.mutationStatusValue === "mutating",
                isChanged: this.changedFields.length > 0,
                isValid: Object.keys(this.errors).length === 0,
                changedFields: this.changedFields,
                touchedFields: this.touchedFields,
                errors: this.errors,
            };
        }
        return this.snapshotCache;
    }

    private get draft(): T | undefined {
        if (this.dataValue === undefined) return undefined;
        if (this.draftOverrides.size === 0) return this.dataValue;
        return applyOverrides(this.dataValue, this.draftOverrides);
    }

    private get changedFields(): string[] {
        if (this.dataValue === undefined || this.draft === undefined) return [];
        return diffPaths(this.dataValue, this.draft);
    }

    private get touchedFields(): string[] {
        return [...this.meta.entries()]
            .filter(([, meta]) => meta.touched)
            .map(([path]) => path);
    }

    private get errors(): Record<string, string> {
        const errors: Record<string, string> = {};
        for (const [path, meta] of this.meta) {
            if (meta.error) errors[path] = meta.error;
        }
        return errors;
    }

    private get queryApi(): ResourceQuery<T> {
        const core = this;
        return {
            get data() { return core.dataValue; },
            get error() { return core.errorValue; },
            get status() { return core.queryStatus; },
            get isLoading() { return core.statusValue === "loading"; },
            get isFetching() { return core.queryStatus === "fetching"; },
            get isStale() { return core.computeIsStale(); },
            get updatedAt() { return core.updatedAt; },
            fetch: core.fetch,
            refetch: core.refetch,
            invalidate: core.invalidate,
            setEnabled: core.setEnabled,
            setStaleTime: core.setStaleTime,
        };
    }

    private get mutationApi(): ResourceMutation<R> {
        const core = this;
        return {
            get status() { return core.mutationStatusValue; },
            get error() { return core.mutationErrorValue; },
            get data() { return core.mutationDataValue; },
            get isSaving() { return core.mutationStatusValue === "mutating"; },
            reset: core.resetMutation,
            retry: async () => core.lastSave ? core.lastSave() : core.save(),
        };
    }

    private get queryStatus(): ResourceQueryStatus {
        if (this.config.source?.query) return normalizeQueryStatus(this.config.source.query);
        if (this.statusValue === "loading") return "fetching";
        if (this.statusValue === "error") return "error";
        if (this.dataValue !== undefined) return "success";
        return "idle";
    }

    field = <V = any>(path: string): FieldController<V> => this.createField(path) as FieldController<V>;

    array = <I = any>(path: string): ArrayFieldController<I> => {
        const core = this;
        const field = this.createField<I[]>(path);
        return {
            ...field,
            get items() { return field.value ?? []; },
            append(item) { core.set(path, (prev: I[] = []) => [...prev, item]); },
            prepend(item) { core.set(path, (prev: I[] = []) => [item, ...prev]); },
            insert(index, item) {
                core.set(path, (prev: I[] = []) => {
                    const next = [...prev];
                    next.splice(index, 0, item);
                    return next;
                });
            },
            remove(index) {
                core.set(path, (prev: I[] = []) => {
                    const next = [...prev];
                    next.splice(index, 1);
                    return next;
                });
            },
            swap(indexA, indexB) {
                core.set(path, (prev: I[] = []) => {
                    const next = [...prev];
                    [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
                    return next;
                });
            },
            move(from, to) {
                core.set(path, (prev: I[] = []) => {
                    const next = [...prev];
                    const [item] = next.splice(from, 1);
                    next.splice(to, 0, item);
                    return next;
                });
            },
        };
    };

    get = <V = any>(path: string): V => getByPath(this.draft, path);
    getInitial = <V = any>(path: string): V => getByPath(this.dataValue, path);

    set = (path: string, value: any | ((prev: any) => any)): void => {
        if (!this.canEdit(path)) return;
        const currentValue = this.draftOverrides.has(path)
            ? this.draftOverrides.get(path)
            : getByPath(this.dataValue, path);
        const nextValue = typeof value === "function" ? value(currentValue) : value;
        const initialValue = getByPath(this.dataValue, path);

        if (Object.is(nextValue, initialValue)) {
            this.draftOverrides.delete(path);
        } else {
            this.draftOverrides.set(path, nextValue);
        }

        for (const plugin of this.config.plugins ?? []) {
            plugin.onFieldChange?.(path, nextValue, this.pluginContext);
        }

        if (this.config.validate?.on === "change") {
            this.validateField(path);
        }

        this.scheduleDraftPersist();
        this.emitField(path);
        this.emit();
    };

    setMany = (patches: Record<string, any>): void => {
        for (const [path, value] of Object.entries(patches)) {
            if (!this.canEdit(path)) continue;
            const currentValue = this.draftOverrides.has(path)
                ? this.draftOverrides.get(path)
                : getByPath(this.dataValue, path);
            const nextValue = typeof value === "function" ? value(currentValue) : value;
            const initialValue = getByPath(this.dataValue, path);
            if (Object.is(nextValue, initialValue)) {
                this.draftOverrides.delete(path);
            } else {
                this.draftOverrides.set(path, nextValue);
            }

            for (const plugin of this.config.plugins ?? []) {
                plugin.onFieldChange?.(path, nextValue, this.pluginContext);
            }
        }
        this.scheduleDraftPersist();
        this.emitAllFields();
        this.emit();
    };

    reset = (path: string): void => {
        this.draftOverrides.delete(path);
        this.meta.delete(path);
        for (const key of [...this.draftOverrides.keys()]) {
            if (key.startsWith(path + ".")) this.draftOverrides.delete(key);
        }
        for (const key of [...this.meta.keys()]) {
            if (key.startsWith(path + ".")) this.meta.delete(key);
        }
        this.scheduleDraftPersist();
        this.emitField(path);
        this.emit();
    };

    resetDraft = (): void => {
        this.draftOverrides.clear();
        this.meta.clear();
        this.clearPersistedDraft();
        this.emitAllFields();
        this.emit();
    };

    touch = (path: string): void => {
        this.patchMeta(path, { touched: true });
        for (const plugin of this.config.plugins ?? []) {
            plugin.onFieldBlur?.(path, this.pluginContext);
        }
        if (this.config.validate?.on === "blur") {
            this.validateField(path);
        }
        this.emitField(path);
        this.emit();
    };

    fetch = async (): Promise<T | undefined> => {
        const fetcher = this.config.source?.fetch;
        if (!fetcher) return this.dataValue;

        this.statusValue = "loading";
        this.errorValue = undefined;
        this.emit();

        try {
            const data = await fetcher();
            this.applySourceValue(data);
            this.persistCache(data);
            return data;
        } catch (error) {
            this.errorValue = error;
            this.statusValue = "error";
            this.emit();
            return undefined;
        }
    };

    refetch = async (): Promise<T | undefined> => {
        const query = this.config.source?.query;
        if (query?.refetch) {
            const data = await query.refetch();
            this.applySourceValue(data);
            return data;
        }
        return this.fetch();
    };

    save = async (): Promise<MutationResult<R>> => {
        this.lastSave = this.save;
        this.mutationStatusValue = "mutating";
        this.mutationErrorValue = undefined;
        this.emit();

        const valid = await this.validate();
        if (!valid) {
            this.mutationStatusValue = "idle";
            this.emit();
            return {
                success: false,
                data: undefined,
                error: new Error("Validation failed."),
            };
        }

        if (this.draft === undefined) {
            this.mutationStatusValue = "idle";
            this.emit();
            return {
                success: false,
                data: undefined,
                error: new Error("No draft data to save."),
            };
        }

        for (const plugin of this.config.plugins ?? []) {
            const result = await plugin.onBeforeMutate?.(this.draft, this.pluginContext);
            if (result === false) {
                return {
                    success: false,
                    data: undefined,
                    error: new Error("Mutation blocked by plugin."),
                };
            }
        }

        const previous = this.dataValue;
        if (this.config.mutation?.optimistic) {
            const optimistic = typeof this.config.mutation.optimistic === "function"
                ? this.config.mutation.optimistic(this.draft, previous)
                : this.draft;
            this.applySourceValue(optimistic, "keepDirty");
        }

        this.mutationStatusValue = "mutating";
        this.mutationErrorValue = undefined;
        this.emit();

        try {
            const result = await this.runSave(this.draft);
            this.mutationStatusValue = "success";
            this.mutationDataValue = result;
            this.mutationErrorValue = undefined;

            const nextData = this.resolveSavedData(result);
            this.applySourceValue(nextData, "resetDraft");
            this.syncWritableSource(nextData);
            this.persistCache(nextData);
            this.clearPersistedDraft();

            for (const plugin of this.config.plugins ?? []) {
                plugin.onAfterMutate?.(result, this.pluginContext);
            }

            this.config.onSaveSuccess?.(result);
            this.emit();
            return { success: true, data: result, error: undefined };
        } catch (error) {
            if (this.config.mutation?.optimistic) {
                this.applySourceValue(previous, "keepDirty");
            }
            this.mutationStatusValue = "error";
            this.mutationErrorValue = error;
            this.mutationDataValue = undefined;

            for (const plugin of this.config.plugins ?? []) {
                plugin.onMutateError?.(error, this.pluginContext);
            }

            this.config.onSaveError?.(error);
            this.emit();
            return { success: false, data: undefined, error };
        }
    };

    validate = async (): Promise<boolean> => {
        const result = await this.validateFields("*");
        return result.valid;
    };

    validateField = async (path: string): Promise<FieldValidationResult> => {
        const result = await this.validateFields([path]);
        const error = result.errors[path];
        return { path, valid: !error, error };
    };

    validateFields = async (paths: string[] | string): Promise<ValidationResult> => {
        const data = this.draft;
        const errors: Record<string, string | undefined> = {};
        if (data === undefined) return { valid: true, errors };

        const requestedPaths = typeof paths === "string"
            ? resolveRequestedPaths(data, paths, this.config.validate?.fields)
            : paths;

        if (this.config.validate?.resolver) {
            const resolved = await this.config.validate.resolver(data, {
                path: typeof paths === "string" && paths !== "*" ? paths : undefined,
                mode: paths === "*" ? "form" : "field",
            });
            if (resolved) Object.assign(errors, filterErrors(resolved, requestedPaths, paths));
        }

        for (const [pattern, validator] of Object.entries(this.config.validate?.fields ?? {})) {
            for (const path of resolvePatternPaths(data, pattern)) {
                if (!matchesRequested(path, requestedPaths, paths)) continue;
                const error = await validator(getByPath(data, path), data);
                errors[path] = error ?? undefined;
            }
        }

        const pathsToClear = paths === "*"
            ? [...this.meta.keys()]
            : requestedPaths;

        for (const path of pathsToClear) {
            if (!(path in errors)) errors[path] = undefined;
        }

        let valid = true;
        for (const [path, error] of Object.entries(errors)) {
            this.patchMeta(path, { error });
            if (error) valid = false;
            this.emitField(path);
        }
        this.emit();
        return { valid, errors };
    };

    subscribe = (listener: (snapshot: ResourceSnapshot<T, R>) => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    subscribeField = (path: string, listener: FieldListener): (() => void) => {
        let listeners = this.fieldListeners.get(path);
        if (!listeners) {
            listeners = new Set();
            this.fieldListeners.set(path, listeners);
        }
        listeners.add(listener);
        return () => {
            listeners!.delete(listener);
            if (listeners!.size === 0) this.fieldListeners.delete(path);
        };
    };

    syncSource = (source: ExistingQuery<T> | ExistingState<T> | { data?: T; value?: T }): void => {
        if ("data" in source) this.applySourceValue(source.data);
        else if ("value" in source) this.applySourceValue(source.value);
        else this.applySourceValue(readState(source as ExistingState<T>));
    };

    destroy = (): void => {
        this.listeners.clear();
        this.fieldListeners.clear();
        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];
        this.pluginCleanups.forEach((cleanup) => cleanup());
        this.pluginCleanups = [];
        if (this.persistTimer) clearTimeout(this.persistTimer);
    };

    private createPluginContext(): PluginContext<T> {
        const core = this;
        return {
            getData: () => core.dataValue,
            getUpdatedData: () => core.draft as T,
            getDraftOverrides: () => core.draftOverrides,
            setField: (path, value) => core.set(path, value),
            setFields: (patches) => core.setMany(patches),
            setInitialData: (data) => core.applySourceValue(data, "resetDraft"),
            resetDrafts: () => core.resetDraft(),
            setFieldError: (path, error) => {
                core.patchMeta(path, { error });
                core.emitField(path);
                core.emit();
            },
            setFieldErrors: (errors) => {
                for (const [path, error] of Object.entries(errors)) {
                    core.patchMeta(path, { error });
                    core.emitField(path);
                }
                core.emit();
            },
            getFieldMeta: (path) => {
                const meta = core.meta.get(path);
                return {
                    isTouched: meta?.touched ?? false,
                    error: meta?.error,
                };
            },
            setStatus: (status) => {
                core.statusValue = status;
                core.emit();
            },
            setError: (error) => {
                core.errorValue = error;
                core.statusValue = "error";
                core.emit();
            },
            subscribe: (listener) => core.subscribe(listener as any),
        };
    }

    private initializePlugins(): void {
        for (const plugin of this.config.plugins ?? []) {
            const cleanup = plugin.onInit?.(this.pluginContext);
            if (typeof cleanup === "function") {
                this.pluginCleanups.push(cleanup);
            }
        }
    }

    private createField<V = any>(path: string): FieldController<V> {
        const value = getByPath(this.draft, path);
        const initialValue = getByPath(this.dataValue, path);
        const isChanged = !Object.is(value, initialValue);
        const isTouched = this.meta.get(path)?.touched ?? false;
        const error = this.meta.get(path)?.error;

        const cachedState = this.fieldStates.get(path);
        if (
            cachedState &&
            Object.is(cachedState.value, value) &&
            Object.is(cachedState.initialValue, initialValue) &&
            cachedState.isChanged === isChanged &&
            cachedState.isTouched === isTouched &&
            cachedState.error === error
        ) {
            return this.fieldControllers.get(path) as FieldController<V>;
        }

        const core = this;
        const controller: FieldController<V> = {
            get path() { return path; },
            get value() { return getByPath(core.draft, path); },
            get initialValue() { return getByPath(core.dataValue, path); },
            get isChanged() { return !Object.is(getByPath(core.draft, path), getByPath(core.dataValue, path)); },
            get isTouched() { return core.meta.get(path)?.touched ?? false; },
            get error() { return core.meta.get(path)?.error; },
            set(val) { core.set(path, val); },
            reset() { core.reset(path); },
            touch() { core.touch(path); },
            validate() { return core.validateField(path); },
        };

        this.fieldStates.set(path, { value, initialValue, isChanged, isTouched, error });
        this.fieldControllers.set(path, controller);

        return controller;
    }

    private canEdit(path: string): boolean {
        if (this.fieldConfigs.size === 0) return true;
        if (this.config.fieldMode === "strict") return isEditable(path, this.fieldConfigs);
        const config = this.fieldConfigs.get(path);
        if (config) return config.readonly !== true && config.editable !== false;
        return true;
    }

    private patchMeta(path: string, patch: Partial<FieldMeta>): void {
        const current = this.meta.get(path) ?? { touched: false, error: undefined };
        this.meta.set(path, { ...current, ...patch });
    }

    private emit(): void {
        this.snapshotCache = undefined;
        const snapshot = this.snapshot;
        for (const listener of this.listeners) listener(snapshot);
    }

    private emitField(path: string): void {
        const listeners = this.fieldListeners.get(path);
        if (!listeners) return;
        const field = this.field(path);
        for (const listener of listeners) listener(field);
    }

    private emitAllFields(): void {
        for (const path of this.fieldListeners.keys()) {
            this.emitField(path);
        }
    }

    private invalidate = (): void => {
        this.isStaleValue = true;
        this.emit();
    };

    private setEnabled = (enabled: boolean): void => {
        this.queryEnabled = enabled;
        if (enabled) this.fetch();
        this.emit();
    };

    private setStaleTime = (staleTime: number): void => {
        this.staleTime = staleTime;
        this.emit();
    };

    private resetMutation = (): void => {
        this.mutationStatusValue = "idle";
        this.mutationErrorValue = undefined;
        this.mutationDataValue = undefined;
        this.config.source?.mutation?.reset?.();
        this.emit();
    };

    private computeIsStale(): boolean {
        if (this.config.source?.query?.isStale !== undefined) return this.config.source.query.isStale;
        if (this.isStaleValue) return true;
        if (this.updatedAt === undefined) return false;
        return Date.now() - this.updatedAt > this.staleTime;
    }

    private async runSave(draft: T): Promise<R> {
        const external = this.config.source?.mutation;
        if (external?.mutateAsync) return external.mutateAsync(draft);

        const save = this.config.source?.save;
        if (save) return save(draft, this.metaForSave());

        throw new Error("No source.save or source.mutation.mutateAsync configured.");
    }

    private resolveSavedData(result: R): T {
        if (result !== undefined && result !== null) return result as unknown as T;
        return this.draft as T;
    }

    private metaForSave() {
        return {
            changedFields: this.changedFields,
            isChanged: this.changedFields.length > 0,
        };
    }

    private syncWritableSource(value: T): void {
        this.config.source?.state?.set?.(value);
        this.config.source?.onChange?.(value);
    }

    private hydrateDraft(): void {
        if (!shouldPersistDraft(this.config.persist) || !this.storage) return;
        this.storage.get<Record<string, any>>(this.persistKey + ":draft")
            .then((draft) => {
                if (draft && typeof draft === "object") {
                    this.setMany(draft);
                }
            })
            .catch((error) => this.handlePersistError(error));
    }

    private hydrateCache(): void {
        if (!shouldPersistCache(this.config.persist) || !this.storage) return;
        this.storage.get<T>(this.persistKey + ":cache")
            .then((data) => {
                if (data !== undefined && data !== null && this.dataValue === undefined) {
                    this.applySourceValue(data, "resetDraft");
                }
            })
            .catch((error) => this.handlePersistError(error));
    }

    private scheduleDraftPersist(): void {
        if (!shouldPersistDraft(this.config.persist) || !this.storage) return;
        if (this.persistTimer) clearTimeout(this.persistTimer);
        const debounce = typeof this.config.persist === "object" ? this.config.persist.debounce ?? 300 : 300;
        this.persistTimer = setTimeout(() => {
            if (this.draftOverrides.size === 0) {
                this.clearPersistedDraft();
            } else {
                this.storage!.set(this.persistKey + ":draft", Object.fromEntries(this.draftOverrides))
                    .catch((error) => this.handlePersistError(error));
            }
        }, debounce);
    }

    private persistCache(data: T): void {
        if (!shouldPersistCache(this.config.persist) || !this.storage) return;
        this.storage.set(this.persistKey + ":cache", data).catch((error) => this.handlePersistError(error));
    }

    private clearPersistedDraft(): void {
        if (!this.storage) return;
        this.storage.remove(this.persistKey + ":draft").catch((error) => this.handlePersistError(error));
    }

    private handlePersistError(error: unknown): void {
        if (typeof this.config.persist === "object" && this.config.persist.onError) {
            this.config.persist.onError(error);
        } else if (typeof console !== "undefined") {
            console.warn("[qortex-resource] Persistence failed:", error);
        }
    }
}

function normalizeResourceStatus(query: ExistingQuery<any>): ResourceStatus {
    if (query.status === "fetching" || query.status === "loading" || query.status === "pending") return "loading";
    if (query.status === "error") return "error";
    if (query.status === "success" || query.data !== undefined) return "ready";
    return "idle";
}

function normalizeQueryStatus(query: ExistingQuery<any>): ResourceQueryStatus {
    if (query.status === "fetching" || query.status === "loading" || query.status === "pending") return "fetching";
    if (query.status === "error") return "error";
    if (query.status === "success" || query.data !== undefined) return "success";
    return "idle";
}

function readState<T>(state: ExistingState<T>): T | undefined {
    return state.get ? state.get() : state.value;
}

function isPromiseLike(value: unknown): value is Promise<any> {
    return !!value && typeof value === "object" && typeof (value as Promise<any>).then === "function";
}

function getPersistKey(config: ResourceConfig<any, any>): string {
    if (typeof config.persist === "object" && config.persist.key) return config.persist.key;
    if (Array.isArray(config.key)) return config.key.map(String).join("#");
    return config.key == null ? "resource" : String(config.key);
}

function shouldPersistDraft(persist: ResourceConfig<any, any>["persist"]): boolean {
    return persist === true || (typeof persist === "object" && persist.draft === true);
}

function shouldPersistCache(persist: ResourceConfig<any, any>["persist"]): boolean {
    return persist === true || (typeof persist === "object" && persist.cache === true);
}

function createStorage(persist: ResourceConfig<any, any>["persist"]): ResourceStorage | undefined {
    if (!persist) return undefined;
    if (typeof persist === "object") {
        if (persist.storage) return persist.storage;
        if (persist.db) {
            return {
                get: (key) => persist.db!.get(key),
                set: (key, value) => persist.db!.set(key, value),
                remove: (key) => persist.db!.del(key),
            };
        }
    }
    const driver = typeof persist === "object" ? persist.driver ?? "localStorage" : "localStorage";
    return {
        async get<T>(key: string): Promise<T | undefined> {
            const storage = browserStorage(driver);
            const value = storage?.getItem(key);
            return value ? JSON.parse(value) : undefined;
        },
        async set<T>(key: string, value: T): Promise<void> {
            browserStorage(driver)?.setItem(key, JSON.stringify(value));
        },
        async remove(key: string): Promise<void> {
            browserStorage(driver)?.removeItem(key);
        },
    };
}

function browserStorage(driver: "localStorage" | "sessionStorage"): Storage | undefined {
    if (typeof window === "undefined") return undefined;
    return driver === "sessionStorage" ? window.sessionStorage : window.localStorage;
}

function resolveRequestedPaths(
    data: any,
    request: string,
    validators?: Record<string, any>,
): string[] {
    if (request === "*") {
        const patterns = Object.keys((validators ?? {}) as Record<string, unknown>);
        return patterns.length === 0 ? [] : patterns.flatMap((pattern) => resolvePatternPaths(data, pattern));
    }
    if (request.includes("*")) return resolvePatternPaths(data, request);
    return [request];
}

function filterErrors(
    errors: Record<string, string | undefined>,
    requestedPaths: string[],
    request: string[] | string,
): Record<string, string | undefined> {
    if (request === "*") return errors;
    const requested = new Set(requestedPaths);
    return Object.fromEntries(Object.entries(errors).filter(([path]) => requested.has(path)));
}

function matchesRequested(path: string, requestedPaths: string[], request: string[] | string): boolean {
    return request === "*" || requestedPaths.includes(path);
}

function resolvePatternPaths(data: any, pattern: string): string[] {
    if (!pattern.includes("*")) return [pattern];
    const results: string[] = [];
    const segments = pattern.split(".");

    function walk(current: any, index: number, path: string[]): void {
        if (index === segments.length) {
            results.push(path.join("."));
            return;
        }
        const segment = segments[index];
        if (segment === "*") {
            if (current == null || typeof current !== "object") return;
            for (const key of Object.keys(current)) {
                walk(current[key], index + 1, [...path, key]);
            }
            return;
        }
        walk(current?.[segment], index + 1, [...path, segment]);
    }

    walk(data, 0, []);
    return results;
}
