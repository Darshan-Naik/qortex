import type { DB, DBOptions, Driver } from "./types";
import { getPrefix, matchPattern } from "./utils";
import { createWebStorageDriver, createIndexedDBDriver } from "./drivers";
import { QortexDBError } from "./errors";

const createDriver = (options: DBOptions): Driver => {
    const prefix = getPrefix(options.name);
    const driver = options.driver ?? "local";

    switch (driver) {
        case "local":
            return createWebStorageDriver(window.localStorage, prefix, "localStorage");
        case "session":
            return createWebStorageDriver(window.sessionStorage, prefix, "sessionStorage");
        case "indexedDB":
            return createIndexedDBDriver(options.name);
    }
};

/**
 * Create a new database instance
 *
 * @param nameOrOptions - Database name (string) or options object
 * @returns Database instance with async key-value methods
 *
 * @example
 * // Simple usage with just a name (uses localStorage)
 * const db = createDB("myapp");
 *
 * @example
 * // With options
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 *
 * @example
 * // Basic operations
 * await db.set("user:1", { name: "John" });
 * const user = await db.get<User>("user:1");
 * const exists = await db.has("user:1");
 * await db.del("user:1");
 *
 * @example
 * // Find keys by pattern
 * const userKeys = await db.scan("user:*");
 *
 * @throws {QortexDBError} If database name is not provided
 */
export const createDB = (nameOrOptions: string | DBOptions): DB => {
    const options: DBOptions =
        typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;

    if (!options.name) {
        throw new QortexDBError("Database name is required");
    }

    const driver = createDriver(options);

    return {
        get: <T>(key: string) => driver.get<T>(key),
        set: <T>(key: string, value: T) => driver.set(key, value),
        del: (key: string) => driver.del(key),
        has: (key: string) => driver.has(key),
        scan: async (pattern: string) => {
            const allKeys = await driver.keys();
            return allKeys.filter((key) => matchPattern(pattern, key));
        },
        drop: () => driver.drop(),
    };
};
