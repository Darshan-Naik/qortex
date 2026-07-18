import { useSyncExternalStore, useMemo, useEffect } from "react";
import { createCollection } from "qortex-resource";
import type { CollectionConfig, Collection } from "qortex-resource";

/**
 * React hook to create and manage a collection lifecycle.
 *
 * @param config - Collection configuration
 * @returns The collection state and bound CRUD actions
 */
export function useCollection<T>(config: CollectionConfig<T>) {
    const collection = useMemo(() => createCollection(config), []);

    useEffect(() => {
        return () => {
            collection.destroy();
        };
    }, [collection]);

    // We subscribe to the collection's overall state
    // Note: A real implementation might want selective subscription to specific entities
    // or just the ID list to avoid re-rendering the whole list when one entity changes.
    // For this design, we keep it simple.
    useSyncExternalStore(
        (listener) => collection.subscribe(listener),
        () => collection.status, // We just need something to trigger the read
    );

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
        // State
        items: collection.selectAll(),
        count: collection.selectCount(),
        status: collection.status,
        isLoading: collection.isLoading,
        error: collection.error,

        // Actions
        ...actions,

        // Raw
        collection,
    };
}
