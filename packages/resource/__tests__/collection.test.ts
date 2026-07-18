import { createCollection } from '../src/collection';
import type { Collection } from '../src/collection';

describe('Collection Engine', () => {
    let collection: Collection<any>;

    beforeEach(() => {
        collection = createCollection({
            getId: (entity: any) => entity.id,
            sortBy: undefined,
            plugins: []
        });
    });

    it('should add resource to collection', () => {
        const id = 'user-1';
        collection.addOne({ id, name: 'Alice', age: 30 });
        
        expect(collection.selectById(id)).toBeDefined();
        
        const resource = collection.getResource(id);
        expect(resource).toBeDefined();
        expect(resource.getData()).toEqual({ id, name: 'Alice', age: 30 });
    });

    it('should update resource in collection', () => {
        const id = 'user-1';
        collection.addOne({ id, name: 'Alice', age: 30 });
        collection.updateOne(id, { age: 31 });
        
        const resource = collection.getResource(id);
        expect(resource.getData()).toEqual({ id, name: 'Alice', age: 31 });
    });

    it('should keep a cached resource in sync when an entity updates', () => {
        const id = 'user-1';
        collection.addOne({ id, name: 'Alice', age: 30 });

        const resource = collection.getResource(id);
        collection.updateOne(id, { age: 31 });

        expect(resource.getData()).toEqual({ id, name: 'Alice', age: 31 });
    });

    it('should support destructured methods', () => {
        const { addOne, updateOne, selectById, removeOne } = collection;

        addOne({ id: 'user-1', name: 'Alice', age: 30 });
        updateOne('user-1', { age: 31 });

        expect(selectById('user-1')).toEqual({ id: 'user-1', name: 'Alice', age: 31 });

        removeOne('user-1');

        expect(selectById('user-1')).toBeUndefined();
    });

    it('should expose only the public collection API at runtime', () => {
        expect(Object.keys(collection).sort()).toEqual([
            'addMany',
            'addOne',
            'destroy',
            'error',
            'getResource',
            'isLoading',
            'removeAll',
            'removeMany',
            'removeOne',
            'selectAll',
            'selectById',
            'selectCount',
            'selectIds',
            'selectWhere',
            'setAll',
            'status',
            'subscribe',
            'subscribeOne',
            'updateMany',
            'updateOne',
            'upsertMany',
            'upsertOne',
        ]);
        expect((collection as any).entities).toBeUndefined();
        expect((collection as any).pluginContext).toBeUndefined();
    });

    it('should preserve collection plugin context and cleanup', () => {
        const events: string[] = [];
        const pluginCollection = createCollection({
            getId: (entity: any) => entity.id,
            plugins: [
                {
                    name: 'collection-contract',
                    onInit: (ctx) => {
                        events.push(`init:${ctx.getData().length}`);
                        ctx.subscribe(() => events.push('subscribe'));
                        ctx.setInitialData([{ id: 'user-1', name: 'Alice' }]);
                        return () => events.push('cleanup');
                    },
                }
            ],
        });

        expect(pluginCollection.selectAll()).toEqual([{ id: 'user-1', name: 'Alice' }]);

        pluginCollection.addOne({ id: 'user-2', name: 'Bob' });

        return new Promise<void>((resolve) => {
            queueMicrotask(() => {
                expect(events).toEqual(['init:0', 'subscribe', 'subscribe']);
                pluginCollection.destroy();
                expect(events.at(-1)).toBe('cleanup');
                resolve();
            });
        });
    });

    it('should remove resource from collection', () => {
        const id = 'user-1';
        collection.addOne({ id, name: 'Alice', age: 30 });
        collection.removeOne(id);
        
        expect(collection.selectById(id)).toBeUndefined();
    });

    it('should allow resource creation via getResource if it does not exist', () => {
        const id = 'user-new';
        expect(collection.selectById(id)).toBeUndefined();
        
        const resource = collection.getResource(id);
        expect(resource).toBeDefined();
        expect(resource.getData()).toBeUndefined();
    });

    it('should allow batch addMany', () => {
        collection.addMany([
            { id: 'user-1', name: 'Alice' },
            { id: 'user-2', name: 'Bob' }
        ]);

        expect(collection.selectById('user-1')).toBeDefined();
        expect(collection.selectById('user-2')).toBeDefined();
        expect(collection.getResource('user-2').getData()).toEqual({ id: 'user-2', name: 'Bob' });
    });
});
