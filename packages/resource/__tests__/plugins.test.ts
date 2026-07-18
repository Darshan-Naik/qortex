import { createResource } from '../src/resource';
import { optimisticPlugin } from '../src/plugins/optimistic';
import { validatePlugin } from '../src/plugins/validate';
import { queryPlugin } from '../src/plugins/query';
import { queryManager } from 'qortex-query';

describe('Resource Plugins', () => {
    describe('plugin contract', () => {
        it('should preserve hook order, context methods, and cleanup', () => {
            const events: string[] = [];

            const resource = createResource({
                initialData: { name: 'John', age: 20 },
                plugins: [
                    {
                        name: 'contract',
                        onInit: (ctx) => {
                            events.push(`init:${ctx.getData()?.name}`);
                            ctx.subscribe(() => events.push('subscribe'));
                            return () => events.push('cleanup');
                        },
                        onInitialData: (data, ctx) => {
                            events.push(`initial:${data.name}:${ctx.getUpdatedData().name}`);
                        },
                        onFieldChange: (path, value, ctx) => {
                            events.push(`change:${path}:${value}`);
                            ctx.setFieldError(path, 'Invalid value');
                        },
                        onFieldBlur: (path, ctx) => {
                            events.push(`blur:${path}:${ctx.getFieldMeta(path).error}`);
                        },
                    }
                ]
            } as any);

            expect(events).toEqual(['init:John', 'initial:John:John']);

            resource.set('name', 'Jane');

            expect(resource.errors.name).toBe('Invalid value');
            expect(events).toEqual([
                'init:John',
                'initial:John:John',
                'change:name:Jane',
                'subscribe',
                'subscribe',
            ]);

            resource.touch('name');

            expect(events).toEqual([
                'init:John',
                'initial:John:John',
                'change:name:Jane',
                'subscribe',
                'subscribe',
                'blur:name:Invalid value',
                'subscribe',
            ]);

            resource.syncSource({ data: { name: 'Server', age: 21 } });

            expect(events).toEqual([
                'init:John',
                'initial:John:John',
                'change:name:Jane',
                'subscribe',
                'subscribe',
                'blur:name:Invalid value',
                'subscribe',
                'initial:Server:Jane',
                'subscribe',
            ]);

            resource.destroy();

            expect(events.at(-1)).toBe('cleanup');
        });

        it('should allow sync onBeforeMutate to abort mutation', async () => {
            const save = jest.fn();
            const resource = createResource({
                initialData: { score: 10 },
                plugins: [
                    {
                        name: 'blocker',
                        onBeforeMutate: () => false,
                    }
                ],
                source: { save },
            } as any);

            const result = await resource.save();

            expect(result.success).toBe(false);
            expect((result.error as Error).message).toBe('Mutation blocked by plugin.');
            expect(save).not.toHaveBeenCalled();
        });
    });

    describe('validatePlugin', () => {
        it('should validate fields and populate error state', () => {
            const mockValidator = (data: any) => {
                const errors: any = {};
                if (!data.name) errors.name = 'Name is required';
                if (data.age < 18) errors.age = 'Must be at least 18';
                return Object.keys(errors).length > 0 ? errors : null;
            };

            const resource = createResource({
                initialData: { name: 'John', age: 20 },
                plugins: [validatePlugin({ resolver: mockValidator, validateOn: 'change' })]
            } as any);

            // Initially valid
            expect(resource.isValid).toBe(true);
            expect(resource.errors).toEqual({});

            // Trigger invalid state
            resource.set('age', 15);
            
            expect(resource.isValid).toBe(false);
            expect(resource.errors.age).toBe('Must be at least 18');
        });
    });

    describe('optimisticPlugin', () => {
        it('should store snapshot before mutate and clear it on success', async () => {
            const resource = createResource({
                initialData: { score: 10 },
                plugins: [optimisticPlugin()],
                source: {
                    save: async (draft) => {
                        return draft;
                    }
                }
            } as any);

            const p = resource.save();

            await p;
            
            expect(resource.mutation.status).toBe('success');
        });

        it('should rollback initialData and updatedData on error', async () => {
            const resource = createResource({
                initialData: { score: 10 },
                plugins: [optimisticPlugin()],
                source: {
                    save: async () => {
                        throw new Error('Failed');
                    }
                }
            } as any);

            resource.set('score', 20); // user optimistically changes UI

            await resource.save();

            expect(resource.mutation.status).toBe('error');
            // Ensure draft rolled back to 10
            expect(resource.draft.score).toBe(10);
            expect(resource.data.score).toBe(10);
        });
    });

    describe('queryPlugin', () => {
        beforeEach(() => {
            queryManager.dangerClearCache();
        });

        it('should initialize and connect to queryManager', () => {
            const resource = createResource({
                initialData: { foo: 'bar' },
                plugins: [
                    queryPlugin({
                        queryKey: 'my-query',
                        fetcher: async () => ({ foo: 'server-bar' }),
                        enabled: false // prevent actual fetch
                    })
                ]
            } as any);

            // It should have registered a query
            const query = queryManager.getQueryState('my-query');
            expect(query).toBeDefined();
            // In our plugin, we pipe the state data to resource initial data.
            // Since enabled=false, data on queryManager might not be set initially
            // But we can check that it registered correctly
            expect(query.status).toBe('idle');
        });
    });
});
