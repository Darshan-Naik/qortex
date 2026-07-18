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
