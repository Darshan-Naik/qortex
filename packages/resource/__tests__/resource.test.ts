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
            const state = resource.get();
            expect(state.status).toBe('ready');
            expect(state.isChanged).toBe(false);
            expect(state.isMutating).toBe(false);
        });

        it('should correctly store initialData', () => {
            const state = resource.get();
            expect(state.data).toEqual({ name: 'John', age: 30 });
            expect(state.updatedData).toEqual({ name: 'John', age: 30 });
        });
    });

    describe('Field Mutators', () => {
        it('should set field and update draft state', () => {
            resource.setField('name', 'Jane');
            
            const state = resource.get();
            expect(state.updatedData.name).toBe('Jane');
            expect(state.isChanged).toBe(true);
            expect(state.changedFields.includes('name')).toBe(true);
        });

        it('should reset field to initial data', () => {
            resource.setField('name', 'Jane');
            resource.resetField('name');
            
            const state = resource.get();
            expect(state.updatedData.name).toBe('John');
            expect(state.changedFields.includes('name')).toBe(false);
            expect(state.isChanged).toBe(false);
        });

        it('should set multiple fields', () => {
            resource.setFields({ name: 'Jane', age: 31 });
            
            const state = resource.get();
            expect(state.updatedData).toEqual({ name: 'Jane', age: 31 });
            expect(state.changedFields.includes('name')).toBe(true);
            expect(state.changedFields.includes('age')).toBe(true);
        });

        it('should support destructured methods', () => {
            const { setField, setFields, get, resetField } = resource;

            setField('name', 'Jane');
            setFields({ age: 31 });

            expect(get().updatedData).toEqual({ name: 'Jane', age: 31 });

            resetField('name');

            expect(get().updatedData).toEqual({ name: 'John', age: 31 });
        });

        it('should expose only the public resource API at runtime', () => {
            expect(Object.keys(resource).sort()).toEqual([
                'changedFields',
                'destroy',
                'errors',
                'get',
                'getData',
                'getField',
                'getUpdatedData',
                'isChanged',
                'isLoading',
                'isMutating',
                'isValid',
                'mutate',
                'mutateAsync',
                'mutationData',
                'mutationError',
                'mutationStatus',
                'resetAll',
                'resetField',
                'setField',
                'setFields',
                'setInitialData',
                'status',
                'subscribe',
                'subscribeField',
                'touchField',
                'touchedFields',
                'validate',
            ]);
            expect((resource as any).draftOverrides).toBeUndefined();
            expect((resource as any).pluginContext).toBeUndefined();
        });
        
        it('should reset all fields', () => {
            resource.setFields({ name: 'Jane', age: 31 });
            resource.resetAll();
            
            const state = resource.get();
            expect(state.updatedData).toEqual(state.data);
            expect(state.changedFields.length).toBe(0);
            expect(state.isChanged).toBe(false);
        });
    });

    describe('Mutation Lifecycle', () => {
        it('should transition through states during mutateAsync', async () => {
            let mutationCalled = false;
            
            const res = createResource({
                initialData: { name: 'John', age: 30 },
                mutate: async (initial, updated) => {
                    mutationCalled = true;
                    return { ...updated, updated: true };
                }
            });

            res.setField('name', 'Jane');
            const mutationPromise = res.mutateAsync();

            expect(res.get().isMutating).toBe(true);
            expect(res.get().mutationStatus).toBe('mutating');

            await mutationPromise;

            const state = res.get();
            expect(mutationCalled).toBe(true);
            expect(state.mutationStatus).toBe('success');
            expect(state.isMutating).toBe(false);
            expect(state.isChanged).toBe(false);
            expect(state.data.updated).toBe(true);
        });

        it('should handle errors in mutation', async () => {
            const res = createResource({
                initialData: { name: 'John' },
                mutate: async () => {
                    throw new Error('Network failed');
                }
            });

            await res.mutateAsync();

            const state = res.get();
            expect(state.mutationStatus).toBe('error');
            expect(state.isMutating).toBe(false);
            expect(state.mutationError).toBeInstanceOf(Error);
            expect((state.mutationError as Error).message).toBe('Network failed');
        });
    });
});
