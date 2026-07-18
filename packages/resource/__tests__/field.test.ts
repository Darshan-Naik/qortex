import { computeFieldState, flattenFieldsConfig } from '../src/field';

describe('Field Engine', () => {
    describe('flattenFieldsConfig', () => {
        it('should flatten nested fields configuration', () => {
            const config = {
                user: {
                    name: { editable: true },
                    age: { editable: true }
                },
                tags: { editable: false, readonly: true }
            } as any;

            const flat = flattenFieldsConfig(config);
            
            expect(flat.has('user')).toBe(false); // not a leaf field
            expect(flat.has('user.name')).toBe(true);
            expect(flat.has('user.age')).toBe(true);
            expect(flat.has('tags')).toBe(true);
            
            expect(flat.get('user.name')).toEqual({ editable: true });
        });

        it('should handle undefined configs', () => {
            const flat = flattenFieldsConfig(undefined);
            expect(flat.size).toBe(0);
        });
    });

    describe('computeFieldState', () => {
        it('should compute unmodified state', () => {
            const state = computeFieldState(
                'name',
                { name: 'John' },
                new Map(),
                new Map()
            );

            expect(state.isChanged).toBe(false);
            expect(state.value).toBe('John');
            expect(state.initialValue).toBe('John');
        });

        it('should compute dirty state when draft differs from initial', () => {
            const state = computeFieldState(
                'name',
                { name: 'John' },
                new Map([['name', 'Jane']]),
                new Map()
            );

            expect(state.isChanged).toBe(true);
            expect(state.value).toBe('Jane');
        });

        it('should mark fields valid by default if no validation error is provided', () => {
            const state = computeFieldState(
                'age',
                { age: 20 },
                new Map([['age', 21]]),
                new Map()
            );

            expect(state.error).toBeUndefined();
        });

        it('should mark fields invalid if error is provided', () => {
            const state = computeFieldState(
                'age',
                { age: 20 },
                new Map([['age', 10]]),
                new Map([['age', { isTouched: true, error: 'Must be at least 18' }]])
            );

            expect(state.error).toBe('Must be at least 18');
        });
    });
});
