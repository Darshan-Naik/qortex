/**
 * @module qortex-db/store
 *
 * DB-backed persister for `qortex-store`.
 *
 * Import from this subpath to keep your bundle lean — the core DB driver
 * and the query persister are not included.
 *
 * @example
 * ```ts
 * import { createDB } from "qortex-db";
 * import { createStorePersister } from "qortex-db/store";
 * import { createStore } from "qortex-store";
 *
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 * const settingsStore = createStore(
 *   (set) => ({ theme: "light" }),
 *   { persister: createStorePersister(db, { storageKey: "settings" }) }
 * );
 * ```
 */
export { createStorePersister } from "./createStorePersister";
export type { StorePersisterConfig } from "./createStorePersister";
