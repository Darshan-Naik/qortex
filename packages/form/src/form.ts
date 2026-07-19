import type {
    ArrayFieldController,
    ArrayFieldEntry,
    FieldConfig,
    FieldController,
    FieldMeta,
    FieldState,
    FieldValidationResult,
    Form,
    FormConfig,
    FormMutator,
    FormSnapshot,
    FormStorage,
    SaveResult,
    ValidationResult,
} from "./types";
import { flattenFieldsConfig, isAllValid, isEditable, collectErrors } from "./field";
import { applyOverrides, getByPath } from "./path";
import {
    createStorage,
    getPersistDebounce,
    getPersistKey,
    handlePersistError,
    shouldPersistCache,
    shouldPersistDraft,
} from "./persist";
import {
    filterErrors,
    matchesRequested,
    resolvePatternPaths,
    resolveRequestedPaths,
} from "./validate";

type FieldListener = (field: FieldController) => void;

const DRAFT_UNSET = Symbol("draft-unset");

/**
 * Create a form that manages source data, draft edits, validation, and save.
 *
 * @typeParam T - Form data shape
 * @param config - Typed configuration (data, validate, persist, …)
 * @returns A subscribeable {@link Form} instance — call `destroy()` when done
 *
 * @example
 * ```ts
 * const user = createForm({
 *   initialData: { name: "" },
 *   validate: { fields: { name: (v) => (!v ? "Required" : null) } },
 * });
 *
 * user.set("name", "Ada");
 * await user.save(async (draft) => api.updateUser(draft));
 * user.destroy();
 * ```
 */
export function createForm<T>(config: FormConfig<T>): Form<T> {
    return new FormCore(config).api;
}

class FormCore<T> {
    api: Form<T>;
    private config: FormConfig<T>;

    private dataValue: T | undefined;
    private draftOverrides = new Map<string, any>();
    private meta = new Map<string, FieldMeta>();
    private listeners = new Set<(snapshot: FormSnapshot<T>) => void>();
    private fieldListeners = new Map<string, Set<FieldListener>>();
    private fieldConfigs: Map<string, FieldConfig>;
    private snapshotCache: FormSnapshot<T> | undefined;
    private persistTimer: ReturnType<typeof setTimeout> | undefined;
    private storage: FormStorage | undefined;
    private persistKey: string;
    private fieldControllers = new Map<string, FieldController>();
    private fieldStates = new Map<string, any>();
    private arrayControllers = new Map<string, ArrayFieldController>();
    private arrayKeys = new Map<string, string[]>();
    private arrayKeyCounter = 0;
    private arrayFieldsCache = new Map<string, ArrayFieldEntry[]>();
    private fieldStateCache = new Map<string, FieldState>();
    private draftCache: T | undefined | typeof DRAFT_UNSET = DRAFT_UNSET;
    private changedFieldsCache: string[] | undefined;
    private errorsCache: Record<string, string> | undefined;
    private touchedFieldsCache: string[] | undefined;
    private isValidCache: boolean | undefined;

    constructor(config: FormConfig<T>) {
        this.config = config;
        this.fieldConfigs = flattenFieldsConfig(this.config.fields);
        this.persistKey = getPersistKey(this.config);
        this.storage = createStorage(this.config.persist);

        this.initializeSource();
        this.api = this.createApi();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        this.hydrateCache();
        this.hydrateDraft();
    }

    private initializeSource(): void {
        if (this.config.data !== undefined) {
            this.applySourceValue(this.config.data, "resetDraft");
            return;
        }

        if (this.config.initialData !== undefined) {
            const initial = typeof this.config.initialData === "function"
                ? (this.config.initialData as () => T)()
                : this.config.initialData;
            this.applySourceValue(initial, "resetDraft");
        }
    }

    private applySourceValue(value: T | undefined, mode = this.config.sourceUpdate ?? "keepDirty"): void {
        const previousData = this.dataValue;
        this.dataValue = value;

        if (mode === "resetDraft" || previousData === undefined || mode === "replaceAll") {
            this.draftOverrides.clear();
            this.arrayKeys.clear();
            this.meta.clear();
            this.invalidateMetaCaches();
        } else {
            this.pruneMatchingOverrides();
        }

        this.invalidateDraftState();
        this.emitAllFields();
        this.emit();
    }

    private createApi(): Form<T> {
        const core = this;

        return {
            get data() { return core.dataValue; },
            get draft() { return core.draft; },
            get isChanged() { return core.changedFields.length > 0; },
            get isValid() { return core.isValid; },
            get changedFields() { return core.changedFields; },
            get touchedFields() { return core.touchedFields; },
            get fieldErrors() { return core.errors; },
            get errors() { return core.errors; },
            field: core.field,
            getFieldState: core.getFieldState,
            array: core.array,
            get: core.get,
            getInitial: core.getInitial,
            set: core.set,
            setMany: core.setMany,
            reset: core.reset,
            resetDraft: core.resetDraft,
            touch: core.touch,
            save: core.save,
            validate: core.validate,
            validateField: core.validateField,
            validateFields: core.validateFields,
            setData: core.setData,
            subscribe: core.subscribe,
            subscribeField: core.subscribeField,
            get snapshot() { return core.snapshot; },
            destroy: core.destroy,
        };
    }

    private get snapshot(): FormSnapshot<T> {
        if (!this.snapshotCache) {
            const errors = this.errors;
            this.snapshotCache = {
                data: this.dataValue,
                draft: this.draft,
                isChanged: this.changedFields.length > 0,
                isValid: this.isValid,
                changedFields: this.changedFields,
                touchedFields: this.touchedFields,
                fieldErrors: errors,
                errors,
            };
        }
        return this.snapshotCache;
    }

    private get draft(): T | undefined {
        if (this.dataValue === undefined) return undefined;
        if (this.draftOverrides.size === 0) return this.dataValue;
        if (this.draftCache !== DRAFT_UNSET) return this.draftCache as T;
        this.draftCache = applyOverrides(this.dataValue, this.draftOverrides);
        return this.draftCache;
    }

    private get changedFields(): string[] {
        if (!this.changedFieldsCache) {
            this.changedFieldsCache = [...this.draftOverrides.keys()];
        }
        return this.changedFieldsCache;
    }

    private get touchedFields(): string[] {
        if (!this.touchedFieldsCache) {
            this.touchedFieldsCache = [...this.meta.entries()]
                .filter(([, meta]) => meta.isTouched)
                .map(([path]) => path);
        }
        return this.touchedFieldsCache;
    }

    private get errors(): Record<string, string> {
        if (!this.errorsCache) {
            this.errorsCache = collectErrors(this.meta);
        }
        return this.errorsCache;
    }

    private get isValid(): boolean {
        if (this.isValidCache === undefined) {
            this.isValidCache = isAllValid(this.meta);
        }
        return this.isValidCache;
    }

    field = <V = any>(path: string): FieldController<V> => this.createField(path) as FieldController<V>;

    getFieldState = <V = any>(path: string): FieldState<V> => {
        const cached = this.fieldStateCache.get(path);
        if (cached) return cached as FieldState<V>;

        const value = getByPath(this.draft, path);
        const initialValue = getByPath(this.dataValue, path);
        const meta = this.meta.get(path);
        const state: FieldState<V> = {
            value,
            initialValue,
            isChanged: !Object.is(value, initialValue),
            isTouched: meta?.isTouched ?? false,
            error: meta?.error,
        };
        this.fieldStateCache.set(path, state);
        return state;
    };

    array = <I = any>(path: string): ArrayFieldController<I> => this.createArray(path) as ArrayFieldController<I>;

    get = <V = any>(path: string): V => getByPath(this.draft, path);
    getInitial = <V = any>(path: string): V => getByPath(this.dataValue, path);

    set = (path: string, value: any | ((prev: any) => any)): void => {
        if (!this.applyFieldPatch(path, value)) return;
        this.runFieldChangeValidation(path);
        this.scheduleDraftPersist();
        this.emitField(path);
        this.emit();
    };

    setMany = (patches: Record<string, any>): void => {
        const changedPaths: string[] = [];
        for (const [path, value] of Object.entries(patches)) {
            if (this.applyFieldPatch(path, value)) changedPaths.push(path);
        }
        for (const path of changedPaths) {
            this.runFieldChangeValidation(path);
        }
        this.scheduleDraftPersist();
        for (const path of changedPaths) {
            this.emitField(path);
        }
        this.emit();
    };

    reset = (path: string): void => {
        this.draftOverrides.delete(path);
        this.meta.delete(path);
        this.arrayKeys.delete(path);
        for (const key of [...this.draftOverrides.keys()]) {
            if (key.startsWith(path + ".")) this.draftOverrides.delete(key);
        }
        for (const key of [...this.meta.keys()]) {
            if (key.startsWith(path + ".")) this.meta.delete(key);
        }
        for (const key of [...this.arrayKeys.keys()]) {
            if (key.startsWith(path + ".")) this.arrayKeys.delete(key);
        }
        this.invalidateDraftState();
        this.invalidateMetaCaches();
        this.scheduleDraftPersist();
        this.emitField(path);
        this.emit();
    };

    resetDraft = (): void => {
        this.draftOverrides.clear();
        this.meta.clear();
        this.arrayKeys.clear();
        this.invalidateDraftState();
        this.invalidateMetaCaches();
        this.clearPersistedDraft();
        this.emitAllFields();
        this.emit();
    };

    touch = (path: string): void => {
        this.patchMeta(path, { isTouched: true });
        if (this.config.validate?.on === "blur" || this.config.validate?.on === "change") {
            this.validateField(path);
        }
        this.emitField(path);
        this.emit();
    };

    save = async (mutator: FormMutator<T>): Promise<SaveResult> => {
        const valid = await this.validate();
        if (!valid) {
            return {
                success: false,
                error: new Error("Validation failed."),
            };
        }

        if (this.draft === undefined) {
            return {
                success: false,
                error: new Error("No draft data to save."),
            };
        }

        try {
            const result = await mutator(this.draft, this.metaForSave());
            this.resetDraft();
            this.config.onSaveSuccess?.(result);
            return { success: true };
        } catch (error) {
            this.config.onSaveError?.(error);
            return { success: false, error };
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
        const affectedPaths: string[] = [];
        for (const [path, error] of Object.entries(errors)) {
            this.patchMeta(path, { error });
            if (error) valid = false;
            affectedPaths.push(path);
        }
        for (const path of affectedPaths) {
            this.emitField(path);
        }
        this.emit();
        return { valid, errors };
    };

    setData = (data: T | undefined): void => {
        this.applySourceValue(data);
        if (data !== undefined) {
            this.persistCache(data);
        }
    };

    subscribe = (listener: (snapshot: FormSnapshot<T>) => void): (() => void) => {
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

    destroy = (): void => {
        this.listeners.clear();
        this.fieldListeners.clear();
        if (this.persistTimer) clearTimeout(this.persistTimer);
    };

    private runFieldChangeValidation(path: string): void {
        const mode = this.config.validate?.on;
        if (mode === "change") {
            this.validateField(path);
            return;
        }
        if (mode === "blur" && this.meta.get(path)?.error) {
            this.validateField(path);
        }
    }

    private applyFieldPatch(path: string, value: any | ((prev: any) => any)): boolean {
        if (!this.canEdit(path)) return false;

        const currentValue = getByPath(this.draft, path);
        const nextValue = typeof value === "function" ? value(currentValue) : value;
        if (Object.is(nextValue, currentValue)) return false;

        this.commitOverride(path, nextValue);

        if (Array.isArray(nextValue)) {
            this.syncArrayKeysLength(path, nextValue.length);
        }

        return true;
    }

    /** Write a concrete next value into the override map (draft-aware). */
    private commitOverride(path: string, nextValue: any): void {
        const initialValue = getByPath(this.dataValue, path);
        if (Object.is(nextValue, initialValue)) {
            this.draftOverrides.delete(path);
            this.invalidateDraftState();
            if (!Object.is(getByPath(this.draft, path), initialValue)) {
                this.draftOverrides.set(path, nextValue);
            }
        } else {
            this.draftOverrides.set(path, nextValue);
        }
        this.invalidateDraftState();
    }

    private invalidateDraftState(): void {
        this.draftCache = DRAFT_UNSET;
        this.changedFieldsCache = undefined;
        this.fieldStateCache.clear();
        this.arrayFieldsCache.clear();
    }

    private invalidateMetaCaches(): void {
        this.errorsCache = undefined;
        this.touchedFieldsCache = undefined;
        this.isValidCache = undefined;
        this.fieldStateCache.clear();
    }

    private pruneMatchingOverrides(): void {
        for (const [path, value] of [...this.draftOverrides.entries()]) {
            if (Object.is(value, getByPath(this.dataValue, path))) {
                this.draftOverrides.delete(path);
            }
        }
    }

    private nextArrayKey(): string {
        return `arr_${this.arrayKeyCounter++}`;
    }

    private syncArrayKeysLength(path: string, length: number): string[] {
        let keys = this.arrayKeys.get(path);
        if (!keys) {
            keys = Array.from({ length }, () => this.nextArrayKey());
            this.arrayKeys.set(path, keys);
            return keys;
        }
        if (keys.length < length) {
            while (keys.length < length) keys.push(this.nextArrayKey());
        } else if (keys.length > length) {
            keys.length = length;
        }
        return keys;
    }

    private getArrayFields<I>(path: string): ArrayFieldEntry<I>[] {
        const cached = this.arrayFieldsCache.get(path);
        if (cached) return cached as ArrayFieldEntry<I>[];

        const items = (getByPath(this.draft, path) as I[] | undefined) ?? [];
        const keys = this.syncArrayKeysLength(path, items.length);
        const fields = items.map((item, index) => ({ id: keys[index], index, item }));
        this.arrayFieldsCache.set(path, fields);
        return fields;
    }

    private mutateArray<I>(
        path: string,
        updater: (prev: I[]) => I[],
        syncKeys: (keys: string[], prev: I[]) => void,
    ): void {
        if (!this.canEdit(path)) return;

        const prev = (getByPath(this.draft, path) as I[] | undefined) ?? [];
        const keys = this.syncArrayKeysLength(path, prev.length);
        syncKeys(keys, prev);
        const next = updater(prev);
        if (Object.is(next, prev)) return;

        this.commitOverride(path, next);
        this.runFieldChangeValidation(path);
        this.scheduleDraftPersist();
        this.emitField(path);
        this.emit();
    }

    private createArray<I = any>(path: string): ArrayFieldController<I> {
        const existing = this.arrayControllers.get(path) as ArrayFieldController<I> | undefined;
        if (existing) return existing;

        const core = this;
        const controller: ArrayFieldController<I> = {
            get path() { return path; },
            get value() { return getByPath(core.draft, path); },
            get initialValue() { return getByPath(core.dataValue, path); },
            get isChanged() {
                return !Object.is(getByPath(core.draft, path), getByPath(core.dataValue, path));
            },
            get isTouched() { return core.meta.get(path)?.isTouched ?? false; },
            get error() { return core.meta.get(path)?.error; },
            get items() { return (getByPath(core.draft, path) as I[] | undefined) ?? []; },
            get fields() { return core.getArrayFields<I>(path); },
            set(val) { core.set(path, val); },
            reset() { core.reset(path); },
            touch() { core.touch(path); },
            validate() { return core.validateField(path); },
            append(item) {
                core.mutateArray<I>(
                    path,
                    (prev) => [...prev, item],
                    (keys) => { keys.push(core.nextArrayKey()); },
                );
            },
            prepend(item) {
                core.mutateArray<I>(
                    path,
                    (prev) => [item, ...prev],
                    (keys) => { keys.unshift(core.nextArrayKey()); },
                );
            },
            insert(index, item) {
                core.mutateArray<I>(
                    path,
                    (prev) => {
                        const next = [...prev];
                        next.splice(index, 0, item);
                        return next;
                    },
                    (keys) => { keys.splice(index, 0, core.nextArrayKey()); },
                );
            },
            remove(index) {
                core.mutateArray<I>(
                    path,
                    (prev) => {
                        const next = [...prev];
                        next.splice(index, 1);
                        return next;
                    },
                    (keys) => { keys.splice(index, 1); },
                );
            },
            swap(indexA, indexB) {
                core.mutateArray<I>(
                    path,
                    (prev) => {
                        const next = [...prev];
                        [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
                        return next;
                    },
                    (keys) => {
                        [keys[indexA], keys[indexB]] = [keys[indexB], keys[indexA]];
                    },
                );
            },
            move(from, to) {
                core.mutateArray<I>(
                    path,
                    (prev) => {
                        const next = [...prev];
                        const [item] = next.splice(from, 1);
                        next.splice(to, 0, item);
                        return next;
                    },
                    (keys) => {
                        const [key] = keys.splice(from, 1);
                        keys.splice(to, 0, key);
                    },
                );
            },
        };

        this.arrayControllers.set(path, controller);
        return controller;
    }

    private createField<V = any>(path: string): FieldController<V> {
        const value = getByPath(this.draft, path);
        const initialValue = getByPath(this.dataValue, path);
        const isChanged = !Object.is(value, initialValue);
        const isTouched = this.meta.get(path)?.isTouched ?? false;
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
            get isTouched() { return core.meta.get(path)?.isTouched ?? false; },
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
        const current = this.meta.get(path) ?? { isTouched: false, error: undefined };
        this.meta.set(path, { ...current, ...patch });
        this.invalidateMetaCaches();
    }

    private emit(): void {
        this.snapshotCache = undefined;
        const snapshot = this.snapshot;
        for (const listener of this.listeners) listener(snapshot);
    }

    private emitField(path: string): void {
        const notified = new Set<string>();
        const notify = (target: string) => {
            if (notified.has(target)) return;
            notified.add(target);
            const listeners = this.fieldListeners.get(target);
            if (!listeners?.size) return;
            const field = this.field(target);
            for (const listener of listeners) listener(field);
        };

        notify(path);

        let cursor = path;
        let dot = cursor.lastIndexOf(".");
        while (dot !== -1) {
            cursor = cursor.slice(0, dot);
            notify(cursor);
            dot = cursor.lastIndexOf(".");
        }

        const prefix = path + ".";
        for (const listenerPath of this.fieldListeners.keys()) {
            if (listenerPath.startsWith(prefix)) notify(listenerPath);
        }
    }

    private emitAllFields(): void {
        for (const path of this.fieldListeners.keys()) {
            const listeners = this.fieldListeners.get(path);
            if (!listeners?.size) continue;
            const field = this.field(path);
            for (const listener of listeners) listener(field);
        }
    }

    private metaForSave() {
        return {
            changedFields: this.changedFields,
            isChanged: this.changedFields.length > 0,
        };
    }

    private hydrateDraft(): void {
        if (!shouldPersistDraft(this.config.persist) || !this.storage) return;
        this.storage.get<Record<string, any>>(this.persistKey + ":draft")
            .then((draft) => {
                if (draft && typeof draft === "object") {
                    this.applyPatchesSilent(draft);
                }
            })
            .catch((error) => handlePersistError(this.config.persist, error));
    }

    /** Restore overrides without running validation (used by persist hydrate). */
    private applyPatchesSilent(patches: Record<string, any>): void {
        const changedPaths: string[] = [];
        for (const [path, value] of Object.entries(patches)) {
            if (this.applyFieldPatch(path, value)) changedPaths.push(path);
        }
        if (changedPaths.length === 0) return;
        this.scheduleDraftPersist();
        for (const path of changedPaths) {
            this.emitField(path);
        }
        this.emit();
    }

    private hydrateCache(): void {
        if (!shouldPersistCache(this.config.persist) || !this.storage) return;
        this.storage.get<T>(this.persistKey + ":cache")
            .then((data) => {
                if (data !== undefined && data !== null && this.dataValue === undefined) {
                    this.applySourceValue(data, "resetDraft");
                }
            })
            .catch((error) => handlePersistError(this.config.persist, error));
    }

    private scheduleDraftPersist(): void {
        if (!shouldPersistDraft(this.config.persist) || !this.storage) return;
        if (this.persistTimer) clearTimeout(this.persistTimer);
        const debounce = getPersistDebounce(this.config.persist);
        this.persistTimer = setTimeout(() => {
            if (this.draftOverrides.size === 0) {
                this.clearPersistedDraft();
            } else {
                this.storage!.set(this.persistKey + ":draft", Object.fromEntries(this.draftOverrides))
                    .catch((error) => handlePersistError(this.config.persist, error));
            }
        }, debounce);
    }

    private persistCache(data: T): void {
        if (!shouldPersistCache(this.config.persist) || !this.storage) return;
        this.storage
            .set(this.persistKey + ":cache", data)
            .catch((error) => handlePersistError(this.config.persist, error));
    }

    private clearPersistedDraft(): void {
        if (!this.storage) return;
        this.storage
            .remove(this.persistKey + ":draft")
            .catch((error) => handlePersistError(this.config.persist, error));
    }
}
