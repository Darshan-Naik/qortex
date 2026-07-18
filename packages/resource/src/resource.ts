import type {
    ResourceConfig,
    Resource,
    ResourceStatus,
    MutationStatus,
    MutationResult,
    ResourceSnapshot,
    FieldMeta,
    FieldState,
    FieldConfig,
    PluginContext,
} from "./types";
import { InternalResourceState } from "./types/state";
import { getSnapshotInternal } from "./resource/snapshot";
import { mutateAsyncInternal, validate } from "./resource/mutation";
import { getByPath, applyOverrides } from "./path";
import {
    flattenFieldsConfig,
    computeFieldState,
    isEditable,
    collectErrors,
    isAllValid,
    DEFAULT_FIELD_META,
} from "./field";

/**
 * Create a new resource instance.
 *
 * A resource is a declarative data lifecycle container that manages
 * fetching, editing, validation, and synchronization of a single entity.
 *
 * @template T - The data type
 * @param config - Resource configuration
 * @returns A `Resource<T>` instance
 */
export function createResource<T>(config: ResourceConfig<T>): Resource<T> {
    return new ResourceCore(config).api;
}

class ResourceCore<T> implements InternalResourceState<T> {
    api: Resource<T>;

    initialData: T | undefined = undefined;
    status: ResourceStatus = "idle";
    statusError: unknown = undefined;

    draftOverrides = new Map<string, any>();
    fieldMetaMap = new Map<string, FieldMeta>();
    fieldStateCache = new Map<string, FieldState>();

    mutationStatus: MutationStatus = "idle";
    mutationError: unknown = undefined;
    mutationData: any = undefined;

    listeners = new Set<(snapshot: ResourceSnapshot<T>) => void>();
    fieldListeners = new Map<string, Set<(state: FieldState) => void>>();

    fieldConfigs: Map<string, FieldConfig>;
    pluginCleanups: Array<() => void> = [];

    snapshotCache: ResourceSnapshot<T> | undefined = undefined;
    pluginContext: PluginContext<T> | undefined = undefined;

    constructor(public config: ResourceConfig<T>) {
        this.fieldConfigs = flattenFieldsConfig(config.fields);
        this.pluginContext = this.createPluginContext();

        this.initializeData();
        this.initializePlugins();
        this.notifyInitialDataPlugins();
        this.api = this.createApi();
    }

    emit = (): void => {
        this.fieldStateCache.clear();
        this.snapshotCache = undefined;
        if (this.listeners.size === 0 && this.fieldListeners.size === 0) return;

        const snapshot = getSnapshotInternal(this);
        for (const listener of this.listeners) listener(snapshot);
    };

    emitField = (path: string): void => {
        this.fieldStateCache.delete(path);
        const set = this.fieldListeners.get(path);
        if (set && set.size > 0) {
            const fieldState = this.getFieldCached(path);
            for (const listener of set) listener(fieldState);
        }
        this.emit();
    };

    getUpdatedDataInternal = (): T => {
        if (this.initialData === undefined) return undefined as any;
        if (this.draftOverrides.size === 0) return this.initialData;
        return applyOverrides(this.initialData, this.draftOverrides);
    };

    getFieldCached = (path: string): FieldState => {
        let fieldState = this.fieldStateCache.get(path);
        if (!fieldState) {
            fieldState = computeFieldState(path, this.initialData, this.draftOverrides, this.fieldMetaMap);
            this.fieldStateCache.set(path, fieldState);
        }
        return fieldState;
    };

    get = (): ResourceSnapshot<T> => getSnapshotInternal(this);
    getData = (): T | undefined => this.initialData;
    getUpdatedData = (): T => this.getUpdatedDataInternal();
    getField = (path: string): FieldState => this.getFieldCached(path);

    setField = (path: string, value: any): void => {
        if (!this.applyFieldPatch(path, value)) {
            return;
        }

        this.emitField(path);
    };

    setFields = (patches: Record<string, any>): void => {
        for (const [path, value] of Object.entries(patches)) {
            this.applyFieldPatch(path, value);
        }
        this.emit();
    };

    resetField = (path: string): void => {
        this.draftOverrides.delete(path);
        for (const key of this.draftOverrides.keys()) {
            if (key.startsWith(path + ".")) {
                this.draftOverrides.delete(key);
            }
        }
        this.fieldMetaMap.delete(path);
        for (const key of this.fieldMetaMap.keys()) {
            if (key.startsWith(path + ".")) {
                this.fieldMetaMap.delete(key);
            }
        }
        this.emitField(path);
    };

    resetAll = (): void => {
        this.draftOverrides.clear();
        this.fieldMetaMap.clear();
        this.mutationStatus = "idle";
        this.mutationError = undefined;
        this.mutationData = undefined;
        this.emit();
    };

    setInitialData = (data: T): void => {
        this.initialData = data;
        this.status = "ready";
        this.statusError = undefined;
        this.notifyInitialDataPlugins(data);
        this.emit();
    };

    touchField = (path: string): void => {
        const existing = this.fieldMetaMap.get(path) ?? {
            ...DEFAULT_FIELD_META,
        };
        if (!existing.isTouched) {
            this.fieldMetaMap.set(path, { ...existing, isTouched: true });
        }
        for (const plugin of this.config.plugins ?? []) {
            plugin.onFieldBlur?.(path, this.pluginContext!);
        }
        this.emitField(path);
    };

    mutate = (): void => {
        mutateAsyncInternal(this).catch(() => { });
    };

    mutateAsync = (): Promise<MutationResult> => mutateAsyncInternal(this);

    validate = (): Promise<boolean> => validate(this);

    subscribe = (listener: (snapshot: ResourceSnapshot<T>) => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    subscribeField = (path: string, listener: (state: FieldState) => void): (() => void) => {
        let set = this.fieldListeners.get(path);
        if (!set) {
            set = new Set();
            this.fieldListeners.set(path, set);
        }
        set.add(listener);
        return () => {
            set!.delete(listener);
            if (set!.size === 0) this.fieldListeners.delete(path);
        };
    };

    destroy = (): void => {
        this.listeners.clear();
        this.fieldListeners.clear();
        this.draftOverrides.clear();
        this.fieldMetaMap.clear();

        for (const cleanup of this.pluginCleanups) {
            cleanup();
        }
        this.pluginCleanups.length = 0;
    };

    get isChanged(): boolean {
        for (const [path, value] of this.draftOverrides) {
            if (!Object.is(value, getByPath(this.initialData, path))) return true;
        }
        return false;
    }

    get isValid(): boolean {
        return isAllValid(this.fieldMetaMap);
    }

    get isMutating(): boolean {
        return this.mutationStatus === "mutating";
    }

    get isLoading(): boolean {
        return this.status === "loading";
    }

    get changedFields(): string[] {
        return [...this.draftOverrides.keys()].filter((path) => {
            return !Object.is(this.draftOverrides.get(path), getByPath(this.initialData, path));
        });
    }

    get touchedFields(): string[] {
        const touched: string[] = [];
        for (const [path, meta] of this.fieldMetaMap) {
            if (meta.isTouched) touched.push(path);
        }
        return touched;
    }

    get errors(): Record<string, string> {
        return collectErrors(this.fieldMetaMap);
    }

    private createApi(): Resource<T> {
        const core = this;

        return {
            get: core.get,
            getData: core.getData,
            getUpdatedData: core.getUpdatedData,
            getField: core.getField,
            setField: core.setField,
            setFields: core.setFields,
            resetField: core.resetField,
            resetAll: core.resetAll,
            setInitialData: core.setInitialData,
            get status() { return core.status; },
            get isChanged() { return core.isChanged; },
            get isValid() { return core.isValid; },
            get isMutating() { return core.isMutating; },
            get isLoading() { return core.isLoading; },
            get changedFields() { return core.changedFields; },
            get touchedFields() { return core.touchedFields; },
            get errors() { return core.errors; },
            mutate: core.mutate,
            mutateAsync: core.mutateAsync,
            validate: core.validate,
            get mutationStatus() { return core.mutationStatus; },
            get mutationError() { return core.mutationError; },
            get mutationData() { return core.mutationData; },
            subscribe: core.subscribe,
            subscribeField: core.subscribeField,
            touchField: core.touchField,
            destroy: core.destroy,
        };
    }

    private createPluginContext(): PluginContext<T> {
        return {
            getData: () => this.initialData,
            getUpdatedData: this.getUpdatedDataInternal,
            getDraftOverrides: () => this.draftOverrides,
            setInitialData: (data: T) => {
                this.initialData = data;
                this.status = "ready";
                this.statusError = undefined;
                this.emit();
            },
            resetDrafts: () => {
                this.draftOverrides.clear();
                this.fieldMetaMap.clear();
                this.emit();
            },
            setFieldError: (path: string, error: string | undefined) => {
                const existing = this.fieldMetaMap.get(path) ?? {
                    ...DEFAULT_FIELD_META,
                };
                this.fieldMetaMap.set(path, { ...existing, error });
                this.emitField(path);
            },
            setFieldErrors: (errors: Record<string, string | undefined>) => {
                for (const [path, error] of Object.entries(errors)) {
                    const existing = this.fieldMetaMap.get(path) ?? {
                        ...DEFAULT_FIELD_META,
                    };
                    this.fieldMetaMap.set(path, { ...existing, error });
                }
                this.emit();
            },
            getFieldMeta: (path: string) =>
                this.fieldMetaMap.get(path) ?? { ...DEFAULT_FIELD_META },
            setStatus: (s: ResourceStatus) => {
                this.status = s;
                this.emit();
            },
            setError: (error: unknown) => {
                this.statusError = error;
                this.status = "error";
                this.emit();
            },
            subscribe: this.subscribe,
        };
    }

    private applyFieldPatch(path: string, value: any): boolean {
        if (this.fieldConfigs.size > 0 && !isEditable(path, this.fieldConfigs)) {
            return false;
        }

        const currentValue = this.draftOverrides.has(path)
            ? this.draftOverrides.get(path)
            : getByPath(this.initialData, path);
        const nextValue = typeof value === "function" ? value(currentValue) : value;

        const initialVal = getByPath(this.initialData, path);
        if (Object.is(nextValue, initialVal)) {
            this.draftOverrides.delete(path);
        } else {
            this.draftOverrides.set(path, nextValue);
        }

        for (const plugin of this.config.plugins ?? []) {
            plugin.onFieldChange?.(path, nextValue, this.pluginContext!);
        }
        return true;
    }

    private initializeData(): void {
        if (typeof this.config.initialData === "function") {
            this.status = "loading";
            try {
                const result = (this.config.initialData as Function)();
                if (result && typeof result === "object" && typeof result.then === "function") {
                    (result as Promise<T>)
                        .then((data) => {
                            this.initialData = data;
                            this.status = "ready";
                            this.notifyInitialDataPlugins(data);
                            this.emit();
                        })
                        .catch((err) => {
                            this.statusError = err;
                            this.status = "error";
                            this.emit();
                        });
                } else {
                    this.initialData = result as T;
                    this.status = "ready";
                }
            } catch (err) {
                this.statusError = err;
                this.status = "error";
            }
        } else if (this.config.initialData !== undefined) {
            this.initialData = this.config.initialData as T;
            this.status = "ready";
        }
    }

    private initializePlugins(): void {
        for (const plugin of this.config.plugins ?? []) {
            const cleanup = plugin.onInit?.(this.pluginContext!);
            if (typeof cleanup === "function") {
                this.pluginCleanups.push(cleanup);
            }
        }
    }

    private notifyInitialDataPlugins(data = this.initialData): void {
        if (data === undefined || this.status !== "ready") return;

        for (const plugin of this.config.plugins ?? []) {
            plugin.onInitialData?.(data, this.pluginContext!);
        }
    }
}
