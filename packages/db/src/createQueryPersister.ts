import type { DB } from "./types";

/**
 * Configuration for the query persister.
 */
export interface QueryPersisterConfig {
    /**
     * Cache-bust key. When changed, stale persisted data is discarded so
     * everything re-fetches from the network.
     * @default "1"
     */
    burstKey?: string;

    /**
     * Key used inside the DB to store the query cache snapshot.
     * Override if you share one DB across multiple query managers.
     * @default "qortex-query-cache"
     */
    storageKey?: string;

    /**
     * Debounce delay (ms) between state updates and actual DB writes.
     * @default 100
     */
    debounceTime?: number;
}

// Fields that cannot be JSON-serialised and must be stripped before saving.
const NON_SERIALIZABLE = new Set([
    "fetcher",
    "equalityFn",
    "fetchPromise",
    "refetch",
    "fromPersisterCache",
]);

/**
 * Create a persister for `qortex-query` backed by any `qortex-db` driver
 * (localStorage, sessionStorage, or IndexedDB).
 *
 * Drop the returned object directly into `setDefaultConfig({ persister })` —
 * it satisfies the `Persister` interface from `qortex-query` via structural
 * compatibility (no import from `qortex-query` required).
 *
 * @example
 * ```ts
 * import { createDB, createQueryPersister } from "qortex-db";
 * import { setDefaultConfig } from "qortex-query";
 *
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 * setDefaultConfig({ persister: createQueryPersister(db, { burstKey: "v2" }) });
 * ```
 */
export const createQueryPersister = (db: DB, config?: QueryPersisterConfig) => {
    const storageKey = config?.storageKey ?? "qortex-query-cache";
    const burstKey = config?.burstKey ?? "1";
    const debounceTime = config?.debounceTime ?? 100;

    // Internal persisted envelope — wraps the payload with metadata.
    type Envelope = { burstKey: string; timestamp: number; queries: Record<string, unknown> };

    let syncTimer: ReturnType<typeof setTimeout> | null = null;
    let hydrationPromise: Promise<void> | null = null;

    const persister = {
        /**
         * Immediately write a serialised queries snapshot to the DB.
         * Called internally by `sync` after the debounce delay.
         */
        save(queries: Record<string, unknown>): void {
            const envelope: Envelope = { burstKey, timestamp: Date.now(), queries };
            db.set(storageKey, envelope).catch((err: unknown) => {
                console.warn("[Qortex DB] Failed to persist query cache:", err);
            });
        },

        /**
         * Async-hydrate the QueryManagerCore cache from the DB.
         * Called once on boot when the persister is configured.
         */
        load(cache: Map<string, unknown>, hasQueriesBeenUsed: boolean): void {
            if (hasQueriesBeenUsed) {
                console.warn(
                    "[Qortex DB] Persister configured after queries were already used. " +
                        "Set the persister before any query access for consistent hydration."
                );
            }

            hydrationPromise = db
                .get<Envelope>(storageKey)
                .then((stored) => {
                    if (!stored) return;

                    if (stored.burstKey !== burstKey) {
                        console.warn(
                            "[Qortex DB] Burst key mismatch — clearing stale query cache."
                        );
                        persister.clear();
                        return;
                    }

                    for (const [key, qs] of Object.entries(stored.queries ?? {})) {
                        if (!qs || typeof qs !== "object") continue;
                        const existing = cache.get(key);
                        cache.set(key, {
                            ...(existing ?? {}),
                            ...(qs as object),
                            // Lets QueryManagerCore know this entry came from persistence,
                            // not from a live fetch.
                            fromPersisterCache: !existing,
                        });
                    }
                })
                .catch((err: unknown) => {
                    console.warn("[Qortex DB] Failed to load query cache:", err);
                });
        },

        /**
         * Debounced sync of the query cache to the DB.
         * Called by QueryManagerCore after every state mutation.
         * Filters out entries with `persist: false` and strips non-serialisable fields.
         */
        sync(cache: Map<string, unknown>): void {
            if (syncTimer) clearTimeout(syncTimer);

            syncTimer = setTimeout(async () => {
                // Ensure hydration has finished so we don't overwrite the DB with a partial cache
                if (hydrationPromise) {
                    await hydrationPromise;
                }

                const queries: Record<string, unknown> = {};

                for (const [key, entry] of cache.entries()) {
                    const state = entry as Record<string, unknown>;

                    // Per-query opt-out.
                    if (state["persist"] === false) continue;

                    // Strip functions / promises before JSON serialisation.
                    const serialized: Record<string, unknown> = {};
                    for (const [k, v] of Object.entries(state)) {
                        if (!NON_SERIALIZABLE.has(k)) serialized[k] = v;
                    }

                    queries[key] = serialized;
                }

                persister.save(queries);
            }, debounceTime);
        },

        /**
         * Remove all persisted query data from the DB.
         * Called by `dangerClearCache` in QueryManagerCore.
         */
        clear(): void {
            db.del(storageKey).catch((err: unknown) => {
                console.warn("[Qortex DB] Failed to clear query cache:", err);
            });
        },
    };

    return persister;
};
