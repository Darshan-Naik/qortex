import { Resource, ResourceStatus } from "./resource";

/**
 * Configuration for `createCollection()`.
 *
 * @template T - The entity type
 */
export interface CollectionConfig<T> {
    /** Extract the unique ID from an entity */
    getId: (entity: T) => string;
    /** Optional sort comparator */
    sortBy?: (a: T, b: T) => number;
}

/**
 * A collection instance returned by `createCollection()`.
 * Manages a normalized list of entities with CRUD operations.
 *
 * @template T - The entity type
 */
export interface Collection<T> {
    // ── Read ──
    /** Get all entities (sorted if sortBy provided) */
    selectAll(): T[];
    /** Get a single entity by ID */
    selectById(id: string): T | undefined;
    /** Get all entity IDs */
    selectIds(): string[];
    /** Get total count */
    selectCount(): number;
    /** Get entities matching a predicate */
    selectWhere(predicate: (entity: T) => boolean): T[];

    // ── Write ──
    /** Add a single entity */
    addOne(entity: T): void;
    /** Add multiple entities */
    addMany(entities: T[]): void;
    /** Replace all entities */
    setAll(entities: T[]): void;
    /** Update a single entity (partial or functional) */
    updateOne(id: string, partial: Partial<T> | ((prev: T) => T)): void;
    /** Update multiple entities */
    updateMany(ids: string[], partial: Partial<T>): void;
    /** Add or update a single entity */
    upsertOne(entity: T): void;
    /** Add or update multiple entities */
    upsertMany(entities: T[]): void;
    /** Remove a single entity */
    removeOne(id: string): void;
    /** Remove multiple entities */
    removeMany(ids: string[]): void;
    /** Remove all entities */
    removeAll(): void;

    // ── Resource Bridge ──
    /** Get a resource instance for editing a single entity */
    getResource(id: string): Resource<T>;

    // ── Status ──
    /** Collection status */
    readonly status: ResourceStatus;
    /** Whether data is loading */
    readonly isLoading: boolean;
    /** Last error */
    readonly error: unknown;
    /**
     * Monotonic version bumped on every collection change.
     * Use with `useSyncExternalStore` so React re-renders when data changes
     * even if `status` stays `"ready"`.
     */
    readonly version: number;

    // ── Reactivity ──
    /** Subscribe to collection changes */
    subscribe(listener: () => void): () => void;
    /** Subscribe to a single entity's changes */
    subscribeOne(id: string, listener: (entity: T | undefined) => void): () => void;
    /** Clean up */
    destroy(): void;
}
