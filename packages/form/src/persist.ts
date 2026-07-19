import type { FormConfig, FormStorage } from "./types";

/**
 * Resolve the storage key segment used for draft/cache persistence.
 * Prefers `persist.key`, then root `key`, then `"form"`.
 */
export function getPersistKey(config: FormConfig<any>): string {
    if (typeof config.persist === "object" && "key" in config.persist && config.persist.key) {
        return config.persist.key;
    }
    if (Array.isArray(config.key)) return config.key.map(String).join("#");
    return config.key == null ? "form" : String(config.key);
}

/** Whether draft overrides should be written to storage. */
export function shouldPersistDraft(persist: FormConfig<any>["persist"]): boolean {
    return persist === true || (typeof persist === "object" && persist.draft === true);
}

/** Whether source cache should be written to storage. */
export function shouldPersistCache(persist: FormConfig<any>["persist"]): boolean {
    return persist === true || (typeof persist === "object" && persist.cache === true);
}

/**
 * Build a {@link FormStorage} adapter from persist config.
 * Returns `undefined` when persistence is disabled.
 */
export function createStorage(persist: FormConfig<any>["persist"]): FormStorage | undefined {
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

/**
 * Report a persistence failure via config `onError`, or `console.warn` as fallback.
 */
export function handlePersistError(
    persist: FormConfig<any>["persist"],
    error: unknown,
): void {
    if (typeof persist === "object" && persist.onError) {
        persist.onError(error);
    } else if (typeof console !== "undefined") {
        console.warn("[qortex-form] Persistence failed:", error);
    }
}

/** Debounce ms for draft writes. Default: 300. */
export function getPersistDebounce(persist: FormConfig<any>["persist"]): number {
    return typeof persist === "object" ? persist.debounce ?? 300 : 300;
}
