import { createResource } from '../src/resource';

describe('Config-driven resource features', () => {
    describe('validate config', () => {
        it('should validate fields on change via config.validate', async () => {
            const resource = createResource({
                initialData: { name: 'John', age: 20 },
                validate: {
                    on: 'change',
                    resolver: (data) => {
                        const errors: Record<string, string> = {};
                        if (!data.name) errors.name = 'Name is required';
                        if (data.age < 18) errors.age = 'Must be at least 18';
                        return Object.keys(errors).length > 0 ? errors : null;
                    },
                },
            });

            expect(resource.isValid).toBe(true);
            expect(resource.errors).toEqual({});

            resource.set('age', 15);
            await Promise.resolve();

            expect(resource.isValid).toBe(false);
            expect(resource.errors.age).toBe('Must be at least 18');
        });

        it('should block save when validation fails', async () => {
            const save = jest.fn(async (draft: { name: string }) => draft);
            const resource = createResource({
                initialData: { name: '' },
                validate: {
                    fields: {
                        name: (value) => (value ? undefined : 'Name is required'),
                    },
                },
                source: { save },
            });

            const result = await resource.save();

            expect(result.success).toBe(false);
            expect((result.error as Error).message).toBe('Validation failed.');
            expect(save).not.toHaveBeenCalled();
            expect(resource.errors.name).toBe('Name is required');
        });
    });

    describe('mutation.optimistic config', () => {
        it('should apply optimistic source update and succeed', async () => {
            const resource = createResource({
                initialData: { score: 10 },
                mutation: { optimistic: true },
                source: {
                    save: async (draft) => draft,
                },
            });

            resource.set('score', 20);
            await resource.save();

            expect(resource.mutation.status).toBe('success');
            expect(resource.data?.score).toBe(20);
            expect(resource.isChanged).toBe(false);
        });

        it('should restore previous source data on optimistic failure while keeping draft', async () => {
            const resource = createResource({
                initialData: { score: 10 },
                mutation: { optimistic: true },
                source: {
                    save: async () => {
                        throw new Error('Failed');
                    },
                },
            });

            resource.set('score', 20);
            await resource.save();

            expect(resource.mutation.status).toBe('error');
            expect(resource.data?.score).toBe(10);
            expect(resource.draft?.score).toBe(20);
            expect(resource.isChanged).toBe(true);
        });
    });

    describe('source.query bridge', () => {
        it('should sync from an external query adapter', () => {
            let data = { foo: 'bar' };
            let listener: (() => void) | undefined;

            const resource = createResource({
                source: {
                    query: {
                        get data() { return data; },
                        status: 'success',
                        subscribe: (cb) => {
                            listener = cb;
                            return () => { listener = undefined; };
                        },
                        refetch: async () => data,
                    },
                },
            });

            expect(resource.data).toEqual({ foo: 'bar' });
            expect(resource.status).toBe('ready');

            data = { foo: 'server-bar' };
            listener?.();

            expect(resource.data).toEqual({ foo: 'server-bar' });
            resource.destroy();
        });
    });

    describe('persist config', () => {
        it('should persist and restore draft overrides', async () => {
            const store = new Map<string, string>();
            const storage = {
                async get<T>(key: string): Promise<T | undefined> {
                    const value = store.get(key);
                    return value ? JSON.parse(value) as T : undefined;
                },
                async set<T>(key: string, value: T): Promise<void> {
                    store.set(key, JSON.stringify(value));
                },
                async remove(key: string): Promise<void> {
                    store.delete(key);
                },
            };

            const resource = createResource({
                key: 'persist-demo',
                initialData: { name: 'John' },
                persist: { draft: true, debounce: 0, storage },
            });

            resource.set('name', 'Jane');
            await new Promise((resolve) => setTimeout(resolve, 10));
            resource.destroy();

            const restored = createResource({
                key: 'persist-demo',
                initialData: { name: 'John' },
                persist: { draft: true, debounce: 0, storage },
            });

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(restored.draft?.name).toBe('Jane');
            restored.destroy();
        });
    });
});
