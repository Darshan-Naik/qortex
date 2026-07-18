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
});
