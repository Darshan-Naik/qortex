import { createResource } from '../src/resource';
import type { Resource } from '../src/types';

describe('Resource Engine', () => {
    let resource: Resource<any>;

    beforeEach(() => {
        resource = createResource({
            initialData: { name: 'John', age: 30 }
        });
    });

    describe('Initialization', () => {
        it('should initialize with status ready', () => {
            expect(resource.status).toBe('ready');
            expect(resource.isChanged).toBe(false);
            expect(resource.isSaving).toBe(false);
        });

        it('should correctly store initialData', () => {
            expect(resource.data).toEqual({ name: 'John', age: 30 });
            expect(resource.draft).toEqual({ name: 'John', age: 30 });
        });
    });

    describe('Field Mutators', () => {
        it('should set field and update draft state', () => {
            resource.set('name', 'Jane');
            
            expect(resource.draft.name).toBe('Jane');
            expect(resource.isChanged).toBe(true);
            expect(resource.changedFields.includes('name')).toBe(true);
        });

        it('should reset field to initial data', () => {
            resource.set('name', 'Jane');
            resource.reset('name');
            
            expect(resource.draft.name).toBe('John');
            expect(resource.changedFields.includes('name')).toBe(false);
            expect(resource.isChanged).toBe(false);
        });

        it('should set multiple fields', () => {
            resource.setMany({ name: 'Jane', age: 31 });
            
            expect(resource.draft).toEqual({ name: 'Jane', age: 31 });
            expect(resource.changedFields.includes('name')).toBe(true);
            expect(resource.changedFields.includes('age')).toBe(true);
        });

        it('should support destructured methods', () => {
            const { set, setMany, reset } = resource;

            set('name', 'Jane');
            setMany({ age: 31 });

            expect(resource.draft).toEqual({ name: 'Jane', age: 31 });

            reset('name');

            expect(resource.draft).toEqual({ name: 'John', age: 31 });
        });

        it('should expose only the public resource API at runtime', () => {
            expect(Object.keys(resource).sort()).toEqual([
                'array',
                'changedFields',
                'data',
                'destroy',
                'draft',
                'error',
                'errors',
                'fetch',
                'field',
                'get',
                'getFieldState',
                'getInitial',
                'isChanged',
                'isError',
                'isFetching',
                'isLoading',
                'isSaving',
                'isValid',
                'mutation',
                'query',
                'refetch',
                'reset',
                'resetDraft',
                'save',
                'set',
                'setMany',
                'snapshot',
                'status',
                'subscribe',
                'subscribeField',
                'syncSource',
                'touch',
                'touchedFields',
                'validate',
                'validateField',
                'validateFields',
            ]);
            expect((resource as any).draftOverrides).toBeUndefined();
        });
        
        it('should reset all fields', () => {
            resource.setMany({ name: 'Jane', age: 31 });
            resource.resetDraft();
            
            expect(resource.draft).toEqual(resource.data);
            expect(resource.changedFields.length).toBe(0);
            expect(resource.isChanged).toBe(false);
        });
    });

    describe('Mutation Lifecycle', () => {
        it('should transition through states during save', async () => {
            let saveCalled = false;
            
            const res = createResource({
                initialData: { name: 'John', age: 30 },
                source: {
                    save: async (draft) => {
                        saveCalled = true;
                        return { ...draft, updated: true };
                    }
                }
            });

            res.set('name', 'Jane');
            const savePromise = res.save();

            expect(res.isSaving).toBe(true);
            expect(res.mutation.status).toBe('mutating');

            await savePromise;

            expect(saveCalled).toBe(true);
            expect(res.mutation.status).toBe('success');
            expect(res.isSaving).toBe(false);
            expect(res.isChanged).toBe(false);
            expect(res.data.updated).toBe(true);
        });

        it('should handle errors in mutation', async () => {
            const res = createResource({
                initialData: { name: 'John' },
                source: {
                    save: async () => {
                        throw new Error('Network failed');
                    }
                }
            });

            await res.save();

            expect(res.mutation.status).toBe('error');
            expect(res.isSaving).toBe(false);
            expect(res.mutation.error).toBeInstanceOf(Error);
            expect((res.mutation.error as Error).message).toBe('Network failed');
        });
    });

    describe('Nested draft overrides', () => {
        it('functional set uses draft value after a parent override', () => {
            const nested = createResource({
                initialData: { profile: { name: 'Ada', city: 'NY' } },
            });

            nested.set('profile', { name: 'Grace', city: 'SF' });
            nested.set('profile.name', (prev: string) => prev + '!');

            expect(nested.get('profile.name')).toBe('Grace!');
            expect(nested.draft?.profile).toEqual({ name: 'Grace!', city: 'SF' });
        });

        it('tracks changedFields from override paths', () => {
            const nested = createResource({
                initialData: { profile: { name: 'Ada', city: 'NY' } },
            });

            nested.set('profile.name', 'Grace');
            expect(nested.changedFields).toEqual(['profile.name']);
            expect(nested.isChanged).toBe(true);

            nested.set('profile.name', 'Ada');
            expect(nested.changedFields).toEqual([]);
            expect(nested.isChanged).toBe(false);
        });

        it('does not emit when set is a no-op', () => {
            let emits = 0;
            resource.subscribe(() => {
                emits += 1;
            });

            resource.set('name', 'John');
            expect(emits).toBe(0);
            expect(resource.isChanged).toBe(false);
        });
    });

    describe('Field subscriptions', () => {
        it('notifies parent field subscribers when a child path changes', () => {
            const nested = createResource({
                initialData: { profile: { name: 'Ada' } },
            });

            let parentSees: string | undefined;
            nested.subscribeField('profile', (field) => {
                parentSees = (field.value as { name: string }).name;
            });

            nested.set('profile.name', 'Grace');
            expect(parentSees).toBe('Grace');
        });

        it('returns a stable getFieldState snapshot until the field changes', () => {
            const a = resource.getFieldState('name');
            const b = resource.getFieldState('name');
            expect(a).toBe(b);

            resource.set('name', 'Jane');
            const c = resource.getFieldState('name');
            expect(c).not.toBe(a);
            expect(c.value).toBe('Jane');
        });

        it('returns stable query and mutation object identities across edits', () => {
            const query1 = resource.query;
            const mutation1 = resource.mutation;
            resource.set('name', 'Jane');
            expect(resource.query).toBe(query1);
            expect(resource.mutation).toBe(mutation1);
        });
    });

    describe('Array fields', () => {
        it('keeps stable array field ids across reorder', () => {
            const list = createResource({
                initialData: { tags: ['a', 'b', 'c'] },
            });

            const before = list.array('tags').fields;
            const idA = before[0].id;
            const idB = before[1].id;
            const idC = before[2].id;

            list.array('tags').swap(0, 2);

            const after = list.array('tags').fields;
            expect(after.map((f) => f.item)).toEqual(['c', 'b', 'a']);
            expect(after[0].id).toBe(idC);
            expect(after[1].id).toBe(idB);
            expect(after[2].id).toBe(idA);
        });

        it('preserves ids for duplicate primitive values on append', () => {
            const list = createResource({
                initialData: { tags: ['x', 'x'] },
            });

            const [first, second] = list.array('tags').fields;
            expect(first.id).not.toBe(second.id);

            list.array('tags').append('x');
            const fields = list.array('tags').fields;
            expect(fields).toHaveLength(3);
            expect(fields[0].id).toBe(first.id);
            expect(fields[1].id).toBe(second.id);
            expect(fields[2].id).not.toBe(first.id);
        });

        it('caches array.fields until the array mutates', () => {
            const list = createResource({
                initialData: { tags: ['a', 'b'] },
            });

            const first = list.array('tags').fields;
            const second = list.array('tags').fields;
            expect(first).toBe(second);

            list.array('tags').append('c');
            const third = list.array('tags').fields;
            expect(third).not.toBe(first);
            expect(third).toHaveLength(3);
        });

        it('does not mutate array keys when the field is readonly', () => {
            const list = createResource({
                initialData: { tags: ['a', 'b'] },
                fields: { tags: { readonly: true } },
            });

            const before = list.array('tags').fields.map((f) => f.id);
            list.array('tags').append('c');
            const after = list.array('tags').fields.map((f) => f.id);

            expect(list.draft?.tags).toEqual(['a', 'b']);
            expect(after).toEqual(before);
        });
    });
});
