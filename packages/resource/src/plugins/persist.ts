import type { Plugin, PluginContext } from "../types";

export interface DraftStorage {
    get<T = unknown>(key: string): Promise<T | undefined | null>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}

export interface DraftDBStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    del(key: string): Promise<void>;
}

/**
 * Options for the persist draft plugin.
 */
export interface PersistDraftOptions {
    /** Unique key for storing the draft in the database/localStorage */
    key: string;
    /** Debounce time in milliseconds for saving changes. Default: 500 */
    debounce?: number;
    /** Browser storage driver. Default: 'localStorage' */
    driver?: "localStorage" | "sessionStorage";
    /** DB instance from `qortex-db`. Takes precedence over `driver`. */
    db?: DraftDBStorage;
    /** Fully custom draft storage adapter. Takes precedence over `db` and `driver`. */
    storage?: DraftStorage;
    /** Called when draft hydration fails. Defaults to console.warn. */
    onError?: (error: unknown) => void;
}

/**
 * Persist Draft Plugin.
 *
 * Automatically saves unsaved edits (draft overrides) to local storage.
 * Restores them when the resource is initialized.
 * Clears them when a mutation successfully completes.
 *
 * @param options - Persistence configuration
 * @returns A Plugin instance
 */
export function persistDraftPlugin<T = any>(
    options: PersistDraftOptions,
): Plugin<T> {
    const { key, debounce = 500, onError = defaultErrorHandler } = options;
    let timeoutId: any = null;

    const storage = createDraftStorage(options);

    function scheduleSave(ctx: PluginContext<T>): void {
        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            const overrides = ctx.getDraftOverrides();
            if (overrides.size > 0) {
                storage.set(key, Object.fromEntries(overrides.entries())).catch(onError);
            } else {
                storage.remove(key).catch(onError);
            }
        }, debounce);
    }

    return {
        name: "persist",

        onInit(ctx: PluginContext<T>) {
            storage.get<Record<string, any>>(key).then((savedDraft) => {
                if (savedDraft && typeof savedDraft === "object") {
                    ctx.setFields(savedDraft);
                }
            }).catch(onError);

            return () => {
                if (timeoutId) clearTimeout(timeoutId);
            };
        },

        onFieldChange(_path: string, _value: any, ctx: PluginContext<T>) {
            scheduleSave(ctx);
        },

        onAfterMutate(_result: any, _ctx: PluginContext<T>) {
            if (timeoutId) clearTimeout(timeoutId);
            storage.remove(key).catch(onError);
        },
    };
}

function createDraftStorage(options: PersistDraftOptions): DraftStorage {
    if (options.storage) return options.storage;

    if (options.db) {
        return {
            get: (key) => options.db!.get(key),
            set: (key, value) => options.db!.set(key, value),
            remove: (key) => options.db!.del(key),
        };
    }

    const driver = options.driver ?? "localStorage";
    return {
        async get<T = unknown>(key: string): Promise<T | undefined> {
            const storage = getBrowserStorage(driver);
            const val = storage?.getItem(key);
            return val ? JSON.parse(val) : undefined;
        },
        async set<T = unknown>(key: string, value: T): Promise<void> {
            getBrowserStorage(driver)?.setItem(key, JSON.stringify(value));
        },
        async remove(key: string): Promise<void> {
            getBrowserStorage(driver)?.removeItem(key);
        },
    };
}

function getBrowserStorage(driver: "localStorage" | "sessionStorage"): Storage | undefined {
    if (typeof window === "undefined") return undefined;
    return driver === "sessionStorage" ? window.sessionStorage : window.localStorage;
}

function defaultErrorHandler(error: unknown): void {
    if (typeof console !== "undefined") {
        console.warn("[qortex-resource] Persist draft plugin failed:", error);
    }
}
