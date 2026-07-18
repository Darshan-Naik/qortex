import { useSyncExternalStore, useMemo, useEffect } from "react";
import { createCollection } from "qortex-resource";
import type { CollectionConfig } from "qortex-resource";

/**
 * Create a collection for the component lifetime and subscribe to its version.
 *
 * Updates re-render even when `status` stays `"ready"`. To reset the list,
 * remount the component (`key={…}` on the parent).
 *
 * @param config - Collection configuration (`getId`, optional `sortBy`)
 * @returns Items, status flags, CRUD actions, and the raw `collection`
 *
 * @example
 * ```tsx
 * function TodoList() {
 *   const { items, addOne, removeOne } = useCollection<Todo>({
 *     getId: (t) => t.id,
 *   });
 *   // …
 * }
 * ```
 */
export function useCollection<T>(config: CollectionConfig<T>) {
    const collection = useMemo(() => createCollection(config), []);

    useEffect(() => {
        return () => {
            collection.destroy();
        };
    }, [collection]);

    const version = useSyncExternalStore(
        (listener) => collection.subscribe(listener),
        () => collection.version,
    );

    const items = useMemo(() => collection.selectAll(), [collection, version]);

    const actions = useMemo(
        () => ({
            addOne: collection.addOne.bind(collection),
            addMany: collection.addMany.bind(collection),
            setAll: collection.setAll.bind(collection),
            updateOne: collection.updateOne.bind(collection),
            updateMany: collection.updateMany.bind(collection),
            upsertOne: collection.upsertOne.bind(collection),
            upsertMany: collection.upsertMany.bind(collection),
            removeOne: collection.removeOne.bind(collection),
            removeMany: collection.removeMany.bind(collection),
            removeAll: collection.removeAll.bind(collection),
            getResource: collection.getResource.bind(collection),
            getById: collection.selectById.bind(collection),
        }),
        [collection],
    );

    return {
        items,
        count: items.length,
        status: collection.status,
        isLoading: collection.isLoading,
        error: collection.error,
        version,
        ...actions,
        collection,
    };
}
