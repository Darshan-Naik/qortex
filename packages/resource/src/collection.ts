import type {
    CollectionConfig,
    Collection,
    Resource,
    ResourceStatus,
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
 *   getId: (todo) => todo.id,
 * });
 *
 * todos.addOne({ id: '1', title: 'Buy milk' });
 * todos.selectAll(); // → [{ id: '1', ... }]
 * ```
 */
export function createCollection<T>(config: CollectionConfig<T>): Collection<T> {
    return new CollectionCore(config).api;
}

class CollectionCore<T> {
    api: Collection<T>;

    private ids: string[] = [];
    private entities = new Map<string, T>();
    private listeners = new Set<() => void>();
    private entityListeners = new Map<string, Set<(entity: T | undefined) => void>>();
    private resourceCache = new Map<string, Resource<T>>();
    private statusValue: ResourceStatus = "idle";
    private errorValue: unknown = undefined;

    constructor(private config: CollectionConfig<T>) {
        this.api = this.createApi();
    }

    selectAll = (): T[] => this.ids.map((id) => this.entities.get(id)!);
    selectById = (id: string): T | undefined => this.entities.get(id);
    selectIds = (): string[] => [...this.ids];
    selectCount = (): number => this.ids.length;
    selectWhere = (predicate: (entity: T) => boolean): T[] => this.selectAll().filter(predicate);

    addOne = (entity: T): void => {
        const id = this.config.getId(entity);
        this.setEntity(id, entity);
        this.sortIds();
        this.emitEntity(id);
    };

    addMany = (newEntities: T[]): void => {
        for (const entity of newEntities) {
            this.setEntity(this.config.getId(entity), entity);
        }
        this.sortIds();
        this.emit();
    };

    setAll = (newEntities: T[]): void => {
        this.ids = [];
        this.entities.clear();
        this.destroyCachedResources();
        for (const entity of newEntities) {
            this.setEntity(this.config.getId(entity), entity);
        }
        this.sortIds();
        this.statusValue = "ready";
        this.errorValue = undefined;
        this.emit();
    };

    updateOne = (id: string, partial: Partial<T> | ((prev: T) => T)): void => {
        const existing = this.entities.get(id);
        if (!existing) return;

        const updated =
            typeof partial === "function"
                ? (partial as (prev: T) => T)(existing)
                : { ...existing, ...partial };

        this.setEntity(id, updated);
        this.sortIds();
        this.emitEntity(id);
    };

    updateMany = (updateIds: string[], partial: Partial<T>): void => {
        for (const id of updateIds) {
            const existing = this.entities.get(id);
            if (existing) {
                this.setEntity(id, { ...existing, ...partial });
            }
        }
        this.sortIds();
        this.emit();
    };

    upsertOne = (entity: T): void => {
        this.addOne(entity);
    };

    upsertMany = (newEntities: T[]): void => {
        this.addMany(newEntities);
    };

    removeOne = (id: string): void => {
        if (!this.entities.has(id)) return;
        this.entities.delete(id);
        this.ids = this.ids.filter((i) => i !== id);
        this.resourceCache.get(id)?.destroy();
        this.resourceCache.delete(id);
        this.emitEntity(id);
    };

    removeMany = (removeIds: string[]): void => {
        const removeSet = new Set(removeIds);
        for (const id of removeIds) {
            this.entities.delete(id);
            this.resourceCache.get(id)?.destroy();
            this.resourceCache.delete(id);
        }
        this.ids = this.ids.filter((id) => !removeSet.has(id));
        this.emit();
    };

    removeAll = (): void => {
        this.ids = [];
        this.entities.clear();
        this.destroyCachedResources();
        this.emit();
    };

    getResource = (id: string): Resource<T> => {
        const cached = this.resourceCache.get(id);
        if (cached) return cached;

        const resource = createResource<T>({
            initialData: this.entities.get(id),
            source: {
                save: async (draft: T) => {
                    this.updateOne(id, () => draft);
                    return draft;
                },
            },
        });

        this.resourceCache.set(id, resource);
        return resource;
    };

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    subscribeOne = (id: string, listener: (entity: T | undefined) => void): (() => void) => {
        let set = this.entityListeners.get(id);
        if (!set) {
            set = new Set();
            this.entityListeners.set(id, set);
        }
        set.add(listener);
        return () => {
            set!.delete(listener);
            if (set!.size === 0) this.entityListeners.delete(id);
        };
    };

    destroy = (): void => {
        this.listeners.clear();
        this.entityListeners.clear();
        this.destroyCachedResources();
    };

    private get status(): ResourceStatus {
        return this.statusValue;
    }

    private get isLoading(): boolean {
        return this.statusValue === "loading";
    }

    private get error(): unknown {
        return this.errorValue;
    }

    private createApi(): Collection<T> {
        const core = this;
        return {
            selectAll: core.selectAll,
            selectById: core.selectById,
            selectIds: core.selectIds,
            selectCount: core.selectCount,
            selectWhere: core.selectWhere,
            addOne: core.addOne,
            addMany: core.addMany,
            setAll: core.setAll,
            updateOne: core.updateOne,
            updateMany: core.updateMany,
            upsertOne: core.upsertOne,
            upsertMany: core.upsertMany,
            removeOne: core.removeOne,
            removeMany: core.removeMany,
            removeAll: core.removeAll,
            getResource: core.getResource,
            get status() { return core.status; },
            get isLoading() { return core.isLoading; },
            get error() { return core.error; },
            subscribe: core.subscribe,
            subscribeOne: core.subscribeOne,
            destroy: core.destroy,
        };
    }

    private setEntity(id: string, entity: T): void {
        if (!this.entities.has(id)) {
            this.ids.push(id);
        }
        this.entities.set(id, entity);
        this.resourceCache.get(id)?.syncSource({ data: entity });
    }

    private destroyCachedResources(): void {
        for (const resource of this.resourceCache.values()) {
            resource.destroy();
        }
        this.resourceCache.clear();
    }

    private emit(): void {
        if (this.listeners.size === 0) return;
        queueMicrotask(() => {
            for (const listener of this.listeners) listener();
        });
    }

    private emitEntity(id: string): void {
        const set = this.entityListeners.get(id);
        if (set && set.size > 0) {
            const entity = this.entities.get(id);
            queueMicrotask(() => {
                for (const listener of set) listener(entity);
            });
        }
        this.emit();
    }

    private sortIds(): void {
        if (!this.config.sortBy) return;

        this.ids.sort((a, b) => {
            const entityA = this.entities.get(a);
            const entityB = this.entities.get(b);
            if (!entityA || !entityB) return 0;
            return this.config.sortBy!(entityA, entityB);
        });
    }
}
