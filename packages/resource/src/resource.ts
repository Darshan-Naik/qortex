import type {
    ResourceConfig,
    Resource,
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
    const state: InternalResourceState<T> = {
        config,
        initialData: undefined,
        status: "idle",
        statusError: undefined,

        draftOverrides: new Map(),
        fieldMetaMap: new Map(),
        fieldStateCache: new Map(),

        mutationStatus: "idle",
        mutationError: undefined,
        mutationData: undefined,

        listeners: new Set(),
        fieldListeners: new Map(),

        fieldConfigs: flattenFieldsConfig(config.fields),
        pluginCleanups: [],

        snapshotCache: undefined,
        pluginContext: undefined,

        emit: () => {
            state.fieldStateCache.clear();
            state.snapshotCache = undefined;
            if (state.listeners.size === 0 && state.fieldListeners.size === 0) return;
            const snapshot = getSnapshotInternal(state);
            for (const listener of state.listeners) listener(snapshot);
        },
        emitField: (path: string) => {
            state.fieldStateCache.delete(path);
            const set = state.fieldListeners.get(path);
            if (set && set.size > 0) {
                const fieldState = state.getFieldCached(path);
                for (const listener of set) listener(fieldState);
            }
            state.emit();
        },
        getUpdatedDataInternal: () => {
            if (state.initialData === undefined) return undefined as any;
            if (state.draftOverrides.size === 0) return state.initialData;
            return applyOverrides(state.initialData, state.draftOverrides);
        },
        getFieldCached: (path: string) => {
            let fieldState = state.fieldStateCache.get(path);
            if (!fieldState) {
                fieldState = computeFieldState(path, state.initialData, state.draftOverrides, state.fieldMetaMap);
                state.fieldStateCache.set(path, fieldState);
            }
            return fieldState;
        }
    };

    // ─────────────────────────────────────────
    // Plugin Context
    // ─────────────────────────────────────────

    state.pluginContext = {
        getData: () => state.initialData,
        getUpdatedData: state.getUpdatedDataInternal,
        getDraftOverrides: () => state.draftOverrides,
        setInitialData: (data: T) => {
            state.initialData = data;
            state.status = "ready";
            state.statusError = undefined;
            state.emit();
        },
        resetDrafts: () => {
            state.draftOverrides.clear();
            state.fieldMetaMap.clear();
            state.emit();
        },
        setFieldError: (path: string, error: string | undefined) => {
            const existing = state.fieldMetaMap.get(path) ?? {
                ...DEFAULT_FIELD_META,
            };
            state.fieldMetaMap.set(path, { ...existing, error });
            state.emitField(path);
        },
        setFieldErrors: (errors: Record<string, string | undefined>) => {
            for (const [path, error] of Object.entries(errors)) {
                const existing = state.fieldMetaMap.get(path) ?? {
                    ...DEFAULT_FIELD_META,
                };
                state.fieldMetaMap.set(path, { ...existing, error });
            }
            state.emit();
        },
        getFieldMeta: (path: string) =>
            state.fieldMetaMap.get(path) ?? { ...DEFAULT_FIELD_META },
        setStatus: (s: any) => {
            state.status = s;
            state.emit();
        },
        setError: (error: unknown) => {
            state.statusError = error;
            state.status = "error";
            state.emit();
        },
        subscribe: (listener) => {
            state.listeners.add(listener);
            return () => state.listeners.delete(listener);
        },
    };

    // ─────────────────────────────────────────
    // Public Methods
    // ─────────────────────────────────────────

    function applyFieldPatch(path: string, value: any): boolean {
        if (state.fieldConfigs.size > 0 && !isEditable(path, state.fieldConfigs)) {
            return false;
        }

        const currentValue = state.draftOverrides.has(path)
            ? state.draftOverrides.get(path)
            : getByPath(state.initialData, path);
        const nextValue = typeof value === "function" ? value(currentValue) : value;

        const initialVal = getByPath(state.initialData, path);
        if (Object.is(nextValue, initialVal)) {
            state.draftOverrides.delete(path);
        } else {
            state.draftOverrides.set(path, nextValue);
        }

        for (const plugin of state.config.plugins ?? []) {
            plugin.onFieldChange?.(path, nextValue, state.pluginContext!);
        }
        return true;
    }

    function setField(path: string, value: any): void {
        if (!applyFieldPatch(path, value)) {
            return;
        }

        state.emitField(path);
    }

    function setFields(patches: Record<string, any>): void {
        for (const [path, value] of Object.entries(patches)) {
            applyFieldPatch(path, value);
        }
        state.emit();
    }

    function resetField(path: string): void {
        state.draftOverrides.delete(path);
        for (const key of state.draftOverrides.keys()) {
            if (key.startsWith(path + ".")) {
                state.draftOverrides.delete(key);
            }
        }
        state.fieldMetaMap.delete(path);
        for (const key of state.fieldMetaMap.keys()) {
            if (key.startsWith(path + ".")) {
                state.fieldMetaMap.delete(key);
            }
        }
        state.emitField(path);
    }

    function resetAll(): void {
        state.draftOverrides.clear();
        state.fieldMetaMap.clear();
        state.mutationStatus = "idle";
        state.mutationError = undefined;
        state.mutationData = undefined;
        state.emit();
    }

    function setInitialData(data: T): void {
        state.initialData = data;
        state.status = "ready";
        state.statusError = undefined;
        for (const plugin of state.config.plugins ?? []) {
            plugin.onInitialData?.(data, state.pluginContext!);
        }
        state.emit();
    }

    function touchField(path: string): void {
        const existing = state.fieldMetaMap.get(path) ?? {
            ...DEFAULT_FIELD_META,
        };
        if (!existing.isTouched) {
            state.fieldMetaMap.set(path, { ...existing, isTouched: true });
        }
        for (const plugin of state.config.plugins ?? []) {
            plugin.onFieldBlur?.(path, state.pluginContext!);
        }
        state.emitField(path);
    }

    function destroy(): void {
        state.listeners.clear();
        state.fieldListeners.clear();
        state.draftOverrides.clear();
        state.fieldMetaMap.clear();

        for (const cleanup of state.pluginCleanups) {
            cleanup();
        }
        state.pluginCleanups.length = 0;
    }

    // Handle initialData
    if (typeof config.initialData === "function") {
        state.status = "loading";
        try {
            const result = (config.initialData as Function)();
            if (result && typeof result === "object" && typeof result.then === "function") {
                (result as Promise<T>)
                    .then((data) => {
                        state.initialData = data;
                        state.status = "ready";
                        for (const plugin of config.plugins ?? []) {
                            plugin.onInitialData?.(data, state.pluginContext!);
                        }
                        state.emit();
                    })
                    .catch((err) => {
                        state.statusError = err;
                        state.status = "error";
                        state.emit();
                    });
            } else {
                state.initialData = result as T;
                state.status = "ready";
            }
        } catch (err) {
            state.statusError = err;
            state.status = "error";
        }
    } else if (config.initialData !== undefined) {
        state.initialData = config.initialData as T;
        state.status = "ready";
    }

    // Initialize plugins
    for (const plugin of config.plugins ?? []) {
        const cleanup = plugin.onInit?.(state.pluginContext!);
        if (typeof cleanup === "function") {
            state.pluginCleanups.push(cleanup);
        }
    }

    if (state.initialData !== undefined && state.status === "ready") {
        for (const plugin of config.plugins ?? []) {
            plugin.onInitialData?.(state.initialData, state.pluginContext!);
        }
    }

    // ─────────────────────────────────────────
    // Build Resource Instance
    // ─────────────────────────────────────────

    const resource: Resource<T> = {
        /** Get the full resource snapshot */
        get: () => getSnapshotInternal(state),
        /** Get the initial/server data (unmodified) */
        getData: () => state.initialData,
        /** Get data with user edits merged */
        getUpdatedData: state.getUpdatedDataInternal,
        /** Get the state of a specific field */
        getField: state.getFieldCached,

        /** Set a field value (direct or functional update) */
        setField,
        /** Set multiple fields at once */
        setFields,
        /** Reset a field to its initial value */
        resetField,
        /** Reset all fields to initial values */
        resetAll,
        /** Manually set the initial data */
        setInitialData,

        /** Overall resource status */
        get status() { return state.status; },
        /** Whether any field has changed */
        get isChanged() {
            for (const [path, value] of state.draftOverrides) {
                if (!Object.is(value, getByPath(state.initialData, path))) return true;
            }
            return false;
        },
        /** Whether all validations pass */
        get isValid() { return isAllValid(state.fieldMetaMap); },
        /** Whether a mutation is in progress */
        get isMutating() { return state.mutationStatus === "mutating"; },
        /** Whether initial data is loading */
        get isLoading() { return state.status === "loading"; },
        /** List of changed field paths */
        get changedFields() {
            return [...state.draftOverrides.keys()].filter((path) => {
                return !Object.is(state.draftOverrides.get(path), getByPath(state.initialData, path));
            });
        },
        /** List of touched field paths */
        get touchedFields() {
            const touched: string[] = [];
            for (const [path, meta] of state.fieldMetaMap) {
                if (meta.isTouched) touched.push(path);
            }
            return touched;
        },
        /** Map of field path → error message */
        get errors() { return collectErrors(state.fieldMetaMap); },

        /** Fire-and-forget mutation (errors tracked in state) */
        mutate: () => { mutateAsyncInternal(state).catch(() => { }); },
        /** Async mutation that returns result */
        mutateAsync: () => mutateAsyncInternal(state),
        /** Run validation only (populate errors) */
        validate: () => validate(state),

        /** Mutation lifecycle status */
        get mutationStatus() { return state.mutationStatus; },
        /** Last mutation error */
        get mutationError() { return state.mutationError; },
        /** Last successful mutation return value */
        get mutationData() { return state.mutationData; },

        /** Subscribe to all state changes */
        subscribe: (listener) => {
            state.listeners.add(listener);
            return () => state.listeners.delete(listener);
        },
        /** Subscribe to a specific field's changes (supports nested paths) */
        subscribeField: (path, listener) => {
            let set = state.fieldListeners.get(path);
            if (!set) {
                set = new Set();
                state.fieldListeners.set(path, set);
            }
            set.add(listener);
            return () => {
                set!.delete(listener);
                if (set!.size === 0) state.fieldListeners.delete(path);
            };
        },
        /** Notify plugins of a field blur event */
        touchField,
        /** Clean up all subscriptions and plugin resources */
        destroy,
    };

    return resource;
}
