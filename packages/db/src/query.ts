/**
 * @module qortex-db/query
 *
 * DB-backed persister for `qortex-query`.
 *
 * Import from this subpath to keep your bundle lean — the core DB driver
 * and the store persister are not included.
 *
 * @example
 * ```ts
 * import { createDB } from "qortex-db";
 * import { createQueryPersister } from "qortex-db/query";
 * import { setDefaultConfig } from "qortex-query";
 *
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 * setDefaultConfig({ persister: createQueryPersister(db, { burstKey: "v2" }) });
 * ```
 */
export { createQueryPersister } from "./persist/createQueryPersister";
export type { QueryPersisterConfig } from "./persist/createQueryPersister";
