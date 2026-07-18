import type {
    CollectionConfig,
    Collection,
    Resource,
    ResourceStatus,
    Plugin,
    PluginContext,
} from "./types";
import { createResource } from "./resource";

/**
 * Create a new collection instance.
 *
 * A collection manages a normalized list of entities with CRUD operations,
 * O(1) lookups by ID, and optional sorting.
 *
 * @template T - The entity type
 * @param config - Collection configuration
 * @returns A `Collection<T>` instance
 *
 * @example
 * ```ts
 * const todos = createCollection<Todo>({
 *   getId: (t) => t.id,
 *   sortBy: (a, b) => a.title.localeCompare(b.title),
 * });
 *
 * todos.addOne({ id: '1', title: 'Buy milk', completed: false });
 * todos.selectAll(); // → [{ id: '1', ... }]
 * ```
 */
export function createCollection<T>(config: CollectionConfig<T>): Collection<T> {
    const { getId, sortBy } = config;

    // ═══ Internal Normalized State ═══
    let ids: string[] = [];
    const entities = new Map<string, T>();
    let status: ResourceStatus = "idle";
    let error: unknown = undefined;

    // ═══ Listeners ═══
    const listeners = new Set<() => void>();
    const entityListeners = new Map<string, Set<(entity: T | undefined) => void>>();

    // ═══ Resource Cache ═══
    const resourceCache = new Map<string, Resource<T>>();

    // ═══ Plugin Support ═══
    const pluginCleanups: Array<() => void> = [];

    // ─────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────

    function emit(): void {
        if (listeners.size === 0) return;
        queueMicrotask(() => {
            for (const listener of listeners) listener();
        });
    }

    function emitEntity(id: string): void {
        const set = entityListeners.get(id);
        if (set && set.size > 0) {
            const entity = entities.get(id);
            queueMicrotask(() => {
                for (const listener of set) listener(entity);
            });
        }
        emit();
    }

    function sortIds(): void {
        if (sortBy) {
            ids.sort((a, b) => {
                const entityA = entities.get(a);
                const entityB = entities.get(b);
                if (!entityA || !entityB) return 0;
                return sortBy(entityA, entityB);
            });
        }
    }

    // ─────────────────────────────────────────
    // Plugin Context (for collection-level plugins)
    // ─────────────────────────────────────────

    const pluginContext: PluginContext<T[]> = {
        getData: () => ids.map((id) => entities.get(id)!),
        getUpdatedData: () => ids.map((id) => entities.get(id)!),
        getDraftOverrides: () => new Map(),
        resetDrafts: () => {},
        setInitialData: (data: T[]) => {
            // setAll equivalent via plugin
            ids = [];
            entities.clear();
            for (const entity of data) {
                const id = getId(entity);
                ids.push(id);
                entities.set(id, entity);
            }
            sortIds();
            status = "ready";
            error = undefined;
            emit();
        },
        setFieldError: () => {},
        setFieldErrors: () => {},
        getFieldMeta: () => ({ isTouched: false, error: undefined }),
        setStatus: (s) => {
            status = s as ResourceStatus;
            emit();
        },
        setError: (err) => {
            error = err;
            status = "error";
            emit();
        },
        subscribe: (listener: any) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };

    // ─────────────────────────────────────────
    // CRUD Methods
    // ─────────────────────────────────────────

    function addOne(entity: T): void {
        const id = getId(entity);
        if (!entities.has(id)) {
            ids.push(id);
        }
        entities.set(id, entity);
        sortIds();
        emitEntity(id);
    }

    function addMany(newEntities: T[]): void {
        for (const entity of newEntities) {
            const id = getId(entity);
            if (!entities.has(id)) {
                ids.push(id);
            }
            entities.set(id, entity);
        }
        sortIds();
        emit();
    }

    function setAll(newEntities: T[]): void {
        ids = [];
        entities.clear();
        resourceCache.clear();
        for (const entity of newEntities) {
            const id = getId(entity);
            ids.push(id);
            entities.set(id, entity);
        }
        sortIds();
        status = "ready";
        emit();
    }

    function updateOne(id: string, partial: Partial<T> | ((prev: T) => T)): void {
        const existing = entities.get(id);
        if (!existing) return;

        const updated =
            typeof partial === "function"
                ? (partial as (prev: T) => T)(existing)
                : { ...existing, ...partial };

        entities.set(id, updated);
        sortIds();
        emitEntity(id);
    }

    function updateMany(updateIds: string[], partial: Partial<T>): void {
        for (const id of updateIds) {
            const existing = entities.get(id);
            if (existing) {
                entities.set(id, { ...existing, ...partial });
            }
        }
        sortIds();
        emit();
    }

    function upsertOne(entity: T): void {
        addOne(entity); // addOne handles both insert and update
    }

    function upsertMany(newEntities: T[]): void {
        addMany(newEntities);
    }

    function removeOne(id: string): void {
        if (!entities.has(id)) return;
        entities.delete(id);
        ids = ids.filter((i) => i !== id);
        resourceCache.get(id)?.destroy();
        resourceCache.delete(id);
        emitEntity(id);
    }

    function removeMany(removeIds: string[]): void {
        const removeSet = new Set(removeIds);
        for (const id of removeIds) {
            entities.delete(id);
            resourceCache.get(id)?.destroy();
            resourceCache.delete(id);
        }
        ids = ids.filter((id) => !removeSet.has(id));
        emit();
    }

    function removeAll(): void {
        ids = [];
        entities.clear();
        for (const resource of resourceCache.values()) {
            resource.destroy();
        }
        resourceCache.clear();
        emit();
    }

    // ─────────────────────────────────────────
    // Resource Bridge
    // ─────────────────────────────────────────

    function getResource(id: string): Resource<T> {
        const cached = resourceCache.get(id);
        if (cached) return cached;

        const entity = entities.get(id);
        const resource = createResource<T>({
            initialData: entity,
            mutate: async (_initial, updated, _meta) => {
                // Sync edits back to the collection
                updateOne(id, () => updated);
                return updated;
            },
        });

        resourceCache.set(id, resource);
        return resource;
    }

    // ─────────────────────────────────────────
    // Initialize Plugins
    // ─────────────────────────────────────────

    for (const plugin of (config.plugins ?? []) as Plugin<T[]>[]) {
        const cleanup = plugin.onInit?.(pluginContext);
        if (typeof cleanup === "function") {
            pluginCleanups.push(cleanup);
        }
    }

    // ─────────────────────────────────────────
    // Build Collection Instance
    // ─────────────────────────────────────────

    return {
        // ── Read ──
        selectAll: () => ids.map((id) => entities.get(id)!),
        selectById: (id: string) => entities.get(id),
        selectIds: () => [...ids],
        selectCount: () => ids.length,
        selectWhere: (predicate: (entity: T) => boolean) =>
            ids.map((id) => entities.get(id)!).filter(predicate),

        // ── Write ──
        addOne,
        addMany,
        setAll,
        updateOne,
        updateMany,
        upsertOne,
        upsertMany,
        removeOne,
        removeMany,
        removeAll,

        // ── Resource Bridge ──
        getResource,

        // ── Status ──
        get status() {
            return status;
        },
        get isLoading() {
            return status === "loading";
        },
        get error() {
            return error;
        },

        // ── Reactivity ──
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        subscribeOne: (id: string, listener: (entity: T | undefined) => void) => {
            let set = entityListeners.get(id);
            if (!set) {
                set = new Set();
                entityListeners.set(id, set);
            }
            set.add(listener);
            return () => {
                set!.delete(listener);
                if (set!.size === 0) entityListeners.delete(id);
            };
        },
        destroy: () => {
            listeners.clear();
            entityListeners.clear();
            ids = [];
            entities.clear();
            for (const resource of resourceCache.values()) {
                resource.destroy();
            }
            resourceCache.clear();
            for (const cleanup of pluginCleanups) cleanup();
            pluginCleanups.length = 0;
        },
    };
}
