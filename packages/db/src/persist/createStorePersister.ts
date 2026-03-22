import type { DB } from "../types";

/**
 * Configuration for the store persister.
 */
export interface StorePersisterConfig {
    /**
     * Cache-bust key. When changed, stale persisted data is discarded and
     * the store keeps its in-memory initial state.
     * @default "1"
     */
    burstKey?: string;

    /**
     * Key used inside the DB to store the serialised store snapshot.
     * Override if you persist multiple stores to the same DB.
     * @default "qortex-store-cache"
     */
    storageKey?: string;

    /**
     * Debounce delay (ms) between store updates and actual DB writes.
     * @default 100
     */
    debounceTime?: number;

    /**
     * Select a slice of state to persist instead of the entire state.
     * Useful for excluding ephemeral/derived fields from storage.
     *
     * @example
     * // Only persist theme and locale, not transient UI state
     * select: (state) => ({ theme: state.theme, locale: state.locale })
     */
    select?: <T>(state: T) => unknown;
}

type Envelope<T> = { burstKey: string; timestamp: number; state: T };

/**
 * Create a persister for `qortex-store` backed by any `qortex-db` driver
 * (localStorage, sessionStorage, or IndexedDB).
 *
 * Pass the returned persister into `createStore` via the `options.persister`
 * argument — hydration and watching wire up automatically.
 *
 * @example
 * ```ts
 * import { createDB, createStorePersister } from "qortex-db";
 * import { createStore } from "qortex-store";
 *
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 *
 * const settingsStore = createStore(
 *   (set) => ({ theme: "light", locale: "en" }),
 *   { persister: createStorePersister(db, { storageKey: "settings", burstKey: "v1" }) }
 * );
 * // ↑ Hydrates from IndexedDB on creation, persists on every change.
 * ```
 */
export const createStorePersister = <T = unknown>(
    db: DB,
    config?: StorePersisterConfig
) => {
    const storageKey = config?.storageKey ?? "qortex-store-cache";
    const burstKey = config?.burstKey ?? "1";
    const debounceTime = config?.debounceTime ?? 100;
    const select = config?.select;

    let writeTimer: ReturnType<typeof setTimeout> | null = null;
    let hydrationPromise: Promise<T | undefined> | null = null;

    const persister = {
        /**
         * Load the last saved snapshot from the DB.
         * Called once automatically by `createStore` when a persister is provided.
         * Returns `undefined` to keep the store's initial state when nothing is saved
         * or when the burst key has changed.
         */
        async hydrate(): Promise<T | undefined> {
            hydrationPromise = db.get<Envelope<T>>(storageKey).then((stored) => {
                if (!stored) return undefined;

                if (stored.burstKey !== burstKey) {
                    console.warn(
                        "[Qortex DB] Burst key mismatch — clearing stale store snapshot."
                    );
                    persister.clear();
                    return undefined;
                }

                return stored.state;
            });

            try {
                return await hydrationPromise;
            } catch (err: unknown) {
                console.warn("[Qortex DB] Failed to hydrate store:", err);
                return undefined;
            }
        },

        /**
         * Debounce-write the current state snapshot to the DB.
         * Called automatically by `createStore` after every state change.
         * If a `select` function is configured, only the selected slice is stored.
         * Otherwise, it automatically filters out non-serializable properties (functions).
         */
        persist(state: T): void {
            if (writeTimer) clearTimeout(writeTimer);
            writeTimer = setTimeout(async () => {
                // Ensure hydration has finished so we don't overwrite the DB before the store is initialized
                if (hydrationPromise) {
                    await hydrationPromise;
                }

                let snapshot: any;
                if (select) {
                    snapshot = select(state);
                } else if (typeof state === "object" && state !== null) {
                    // Automatically filter out functions (actions) which cannot be persisted
                    snapshot = Object.keys(state).reduce((acc: any, key) => {
                        const value = (state as any)[key];
                        if (typeof value !== "function") {
                            acc[key] = value;
                        }
                        return acc;
                    }, Array.isArray(state) ? [] : {});
                } else {
                    snapshot = state;
                }

                const envelope: Envelope<unknown> = {
                    burstKey,
                    timestamp: Date.now(),
                    state: snapshot,
                };
                db.set(storageKey, envelope).catch((err: unknown) => {
                    console.warn("[Qortex DB] Failed to persist store:", err);
                });
            }, debounceTime);
        },

        /**
         * Remove the persisted store snapshot from the DB.
         */
        clear(): void {
            db.del(storageKey).catch((err: unknown) => {
                console.warn("[Qortex DB] Failed to clear store snapshot:", err);
            });
        },
    };

    return persister;
};
