import { getByPath, setByPath, deleteByPath, hasPath, diffPaths, applyOverrides } from '../src/path';

describe('Path Engine', () => {
    describe('getByPath', () => {
        it('should retrieve top-level values', () => {
            const obj = { name: 'John' };
            expect(getByPath(obj, 'name')).toBe('John');
        });

        it('should retrieve nested values', () => {
            const obj = { user: { profile: { age: 30 } } };
            expect(getByPath(obj, 'user.profile.age')).toBe(30);
        });

        it('should retrieve array elements', () => {
            const obj = { tags: ['a', 'b', 'c'] };
            expect(getByPath(obj, 'tags.1')).toBe('b');
        });

        it('should return undefined for missing paths', () => {
            const obj = { user: {} };
            expect(getByPath(obj, 'user.name')).toBeUndefined();
            expect(getByPath(undefined, 'user.name')).toBeUndefined();
        });
    });

    describe('setByPath', () => {
        it('should set top-level values immutably', () => {
            const obj = { name: 'John', age: 20 };
            const next = setByPath(obj, 'name', 'Jane');
            expect(next).not.toBe(obj);
            expect(next).toEqual({ name: 'Jane', age: 20 });
        });

        it('should set nested values and clone intermediate objects', () => {
            const obj = { user: { profile: { age: 30 }, active: true } };
            const next = setByPath(obj, 'user.profile.age', 31);
            
            expect(next).not.toBe(obj);
            expect(next.user).not.toBe(obj.user);
            expect(next.user.profile).not.toBe(obj.user.profile);
            
            // Unchanged branches should retain reference
            expect(next.user.active).toBe(obj.user.active);
            expect(next.user.profile.age).toBe(31);
        });

        it('should handle array paths', () => {
            const obj = { tags: ['a', 'b'] };
            const next = setByPath(obj, 'tags.1', 'c');
            
            expect(next.tags).toEqual(['a', 'c']);
            expect(Array.isArray(next.tags)).toBe(true);
        });

        it('should create intermediate objects if they do not exist', () => {
            const obj = {};
            const next = setByPath(obj, 'a.b.c', 1);
            expect(next).toEqual({ a: { b: { c: 1 } } });
        });

        it('should correctly set deeply nested array values', () => {
            const obj = { data: { list: [1, 2] } };
            const next = setByPath(obj, 'data.list.1', 3);
            expect(next).toEqual({ data: { list: [1, 3] } });
        });
    });

    describe('deleteByPath', () => {
        it('should delete top level properties', () => {
            const obj = { a: 1, b: 2 };
            const next = deleteByPath(obj, 'a');
            expect(next).toEqual({ b: 2 });
            expect(next).not.toBe(obj);
        });

        it('should delete nested properties immutably', () => {
            const obj = { a: { b: 1, c: 2 } };
            const next = deleteByPath(obj, 'a.b');
            expect(next).toEqual({ a: { c: 2 } });
        });

        it('should return cloned object if path does not exist', () => {
            const obj = { a: 1 };
            const next = deleteByPath(obj, 'b');
            expect(next).toEqual(obj);
            expect(next).not.toBe(obj); // deleteByPath currently clones early
        });

        it('should splice arrays when deleting array index', () => {
            const obj = { items: ['a', 'b', 'c'] };
            const next = deleteByPath(obj, 'items.1');
            expect(next.items).toEqual(['a', 'c']);
        });
    });

    describe('hasPath', () => {
        it('should return false if value is explicitly undefined', () => {
            const obj = { a: { b: 1, c: undefined } };
            expect(hasPath(obj, 'a.b')).toBe(true);
            expect(hasPath(obj, 'a.c')).toBe(false);
        });

        it('should return false if path does not exist', () => {
            const obj = { a: { b: 1 } };
            expect(hasPath(obj, 'a.c')).toBe(false);
            expect(hasPath(obj, 'b')).toBe(false);
            expect(hasPath(undefined, 'a')).toBe(false);
        });
    });

    describe('diffPaths', () => {
        it('should return an array of changed paths (shallow)', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };
            expect(diffPaths(obj1, obj2)).toEqual(['b']);
        });

        it('should deeply diff paths', () => {
            const obj1 = { user: { name: 'A', age: 20 }, tags: ['x'] };
            const obj2 = { user: { name: 'A', age: 21 }, tags: ['y'] };
            expect(diffPaths(obj1, obj2)).toEqual(['user.age', 'tags.0']);
        });

        it('should handle added and removed paths', () => {
            const obj1 = { a: { b: 1 } };
            const obj2 = { a: { c: 2 } };
            // Depending on implementation, might return 'a.b' and 'a.c' or just 'a'
            // In our simple diffPaths, it diffs all keys
            const diff = diffPaths(obj1, obj2);
            expect(diff).toContain('a.b');
            expect(diff).toContain('a.c');
        });
    });

    describe('applyOverrides', () => {
        it('should apply a flat map of overrides to an object', () => {
            const base = { user: { name: 'A', age: 20 }, active: true };
            const overrides = new Map([
                ['user.name', 'B'],
                ['active', false]
            ]);
            
            const next = applyOverrides(base, overrides);
            expect(next).toEqual({
                user: { name: 'B', age: 20 },
                active: false
            });
        });
    });
});
