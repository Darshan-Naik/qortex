/**
 * Base store operations shared by Driver and DB
 */
export type BaseStore = {
    /**
     * Retrieve a value by key
     * @param key - The key to look up
     * @returns The value if found, undefined otherwise
     * @example
     * const user = await db.get<User>("user:1");
     */
    get<T = unknown>(key: string): Promise<T | undefined>;

    /**
     * Store a value with the given key
     * @param key - The key to store under
     * @param value - The value to store (will be JSON serialized)
     * @example
     * await db.set("user:1", { name: "John", age: 30 });
     */
    set<T = unknown>(key: string, value: T): Promise<void>;

    /**
     * Delete a key-value pair
     * @param key - The key to delete
     * @example
     * await db.del("user:1");
     */
    del(key: string): Promise<void>;

    /**
     * Check if a key exists
     * @param key - The key to check
     * @returns true if the key exists, false otherwise
     * @example
     * if (await db.has("user:1")) { ... }
     */
    has(key: string): Promise<boolean>;

    /**
     * Delete all data belonging to this database instance
     * @example
     * await db.drop();
     */
    drop(): Promise<void>;
};

/**
 * Internal driver interface for storage backends
 * @internal
 */
export type Driver = BaseStore & {
    /** Get all keys in this database */
    keys(): Promise<string[]>;
};

/**
 * Database instance returned by createDB
 * Provides a Redis-like async key-value API
 */
export type DB = BaseStore & {
    /**
     * Find keys matching a pattern (supports "*" wildcard)
     * @param pattern - Pattern to match ("*" for all, "user:*" for prefix)
     * @returns Array of matching keys
     * @example
     * const userKeys = await db.scan("user:*");
     * const allKeys = await db.scan("*");
     */
    scan(pattern: string): Promise<string[]>;
};

/**
 * Available storage drivers
 * - `local` - localStorage (persists across sessions)
 * - `session` - sessionStorage (cleared on tab close)
 * - `indexedDB` - IndexedDB (larger storage, async)
 */
export type DriverType = "local" | "session" | "indexedDB";

/**
 * Options for creating a database instance
 */
export type DBOptions = {
    /** Unique name for this database (used for key namespacing) */
    name: string;
    /** Storage driver to use (defaults to "local") */
    driver?: DriverType;
};
