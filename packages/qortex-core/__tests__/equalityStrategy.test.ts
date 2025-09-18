import { registerFetcher, fetchQuery, getQueryData, setQueryData, getQueryState, dangerClearCache } from '../src/queryManager';
import { equal, getEqualityFunction } from '../src/utils';

describe('EqualityStrategy', () => {
    beforeEach(() => {
        dangerClearCache();
    });

    describe('unified equal function', () => {
        it('should handle shallow equality correctly', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            const obj3 = { a: 1, b: { c: 3 } };

            // Shallow equality should return false for nested object differences
            expect(equal(obj1, obj2, 'shallow')).toBe(false);
            expect(equal(obj1, obj3, 'shallow')).toBe(false);
        });

        it('should handle deep equality correctly', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            const obj3 = { a: 1, b: { c: 3 } };

            // Deep equality should return true for structurally equal objects
            expect(equal(obj1, obj2, 'deep')).toBe(true);
            expect(equal(obj1, obj3, 'deep')).toBe(false);
        });

        it('should handle arrays correctly', () => {
            const arr1 = [1, { a: 2 }, [3, 4]];
            const arr2 = [1, { a: 2 }, [3, 4]];
            const arr3 = [1, { a: 3 }, [3, 4]];

            expect(equal(arr1, arr2, 'shallow')).toBe(false); // Shallow doesn't compare nested objects
            expect(equal(arr1, arr2, 'deep')).toBe(true);
            expect(equal(arr1, arr3, 'deep')).toBe(false);
        });

        it('should default to shallow equality', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };

            expect(equal(obj1, obj2)).toBe(false); // Default to shallow
            expect(equal(obj1, obj2, 'shallow')).toBe(false);
            expect(equal(obj1, obj2, 'deep')).toBe(true);
        });
    });

    describe('getEqualityFunction', () => {
        it('should return custom function when provided', () => {
            const customFn = (a: any, b: any) => a === b;
            const result = getEqualityFunction('deep', customFn);
            expect(result).toBe(customFn);
        });

        it('should return function that uses deep strategy', () => {
            const result = getEqualityFunction('deep');
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            expect(result(obj1, obj2)).toBe(true); // Deep equality should return true
        });

        it('should return function that uses shallow strategy', () => {
            const result = getEqualityFunction('shallow');
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            expect(result(obj1, obj2)).toBe(false); // Shallow equality should return false
        });

        it('should default to shallow strategy when no strategy provided', () => {
            const result = getEqualityFunction();
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            expect(result(obj1, obj2)).toBe(false); // Default to shallow equality
        });
    });

    describe('equalityStrategy in query options', () => {
        it('should use shallow equality by default', () => {
            const data1 = { a: 1, b: { c: 2 } };
            const data2 = { a: 1, b: { c: 2 } }; // Same structure, different reference

            registerFetcher(['test-shallow'], {
                fetcher: () => Promise.resolve(data1)
            });

            // Set initial data
            setQueryData(['test-shallow'], data1);
            const stored1 = getQueryData(['test-shallow']);

            // Set same structure but different reference
            setQueryData(['test-shallow'], data2);
            const stored2 = getQueryData(['test-shallow']);

            // Should be different references (shallow equality returns false for nested objects)
            expect(stored1).not.toBe(stored2);
            expect(stored1).toBe(data1);
            expect(stored2).toBe(data2);
        });

        it('should use deep equality when specified', () => {
            const data1 = { a: 1, b: { c: 2 } };
            const data2 = { a: 1, b: { c: 2 } }; // Same structure, different reference

            registerFetcher(['test-deep'], {
                fetcher: () => Promise.resolve(data1),
                equalityStrategy: 'deep'
            });

            // Set initial data
            setQueryData(['test-deep'], data1);
            const stored1 = getQueryData(['test-deep']);

            // Set same structure but different reference
            setQueryData(['test-deep'], data2);
            const stored2 = getQueryData(['test-deep']);

            // Should be same reference (deep equality detected no change)
            expect(stored1).toBe(stored2);
            expect(stored1).toBe(data1); // Should keep the original reference
        });

        it('should use custom equality function when provided', () => {
            const customEquality = jest.fn()
                .mockReturnValueOnce(false) // First call: allow setting data1
                .mockReturnValueOnce(true);  // Second call: keep original data
            const data1 = { a: 1 };
            const data2 = { a: 1 }; // Same structure, different reference

            registerFetcher(['test-custom'], {
                fetcher: () => Promise.resolve(data1),
                equalityFn: customEquality
            });

            // Set initial data
            setQueryData(['test-custom'], data1);
            const stored1 = getQueryData(['test-custom']);

            // Set same structure but different reference
            setQueryData(['test-custom'], data2);
            const stored2 = getQueryData(['test-custom']);

            // Custom function should be called
            expect(customEquality).toHaveBeenCalledTimes(2);
            expect(stored1).toBe(stored2);
            expect(stored1).toBe(data1); // Should keep the original reference
            expect(stored2).toBe(data1); // Should keep the original reference
        });

        it('should prioritize custom equality function over strategy', () => {
            const customEquality = jest.fn().mockReturnValue(false);
            const data1 = { a: 1 };
            const data2 = { a: 1 }; // Same structure, different reference

            registerFetcher(['test-priority'], {
                fetcher: () => Promise.resolve(data1),
                equalityStrategy: 'deep',
                equalityFn: customEquality
            });

            // Set initial data
            setQueryData(['test-priority'], data1);
            const stored1 = getQueryData(['test-priority']);

            // Set same structure but different reference
            setQueryData(['test-priority'], data2);
            const stored2 = getQueryData(['test-priority']);

            // Custom function should be used, not deep equality
            expect(customEquality).toHaveBeenCalled();
            expect(stored1).not.toBe(stored2); // Custom function returned false
            expect(stored1).toBe(data1);
            expect(stored2).toBe(data2);
        });
    });

    describe('equalityStrategy with state management', () => {
        it('should preserve data reference with deep equality during setQueryData', () => {
            const data1 = { users: [{ id: 1, name: 'John' }] };
            const data2 = { users: [{ id: 1, name: 'John' }] }; // Same structure, different reference

            registerFetcher(['test-state-deep'], {
                fetcher: () => Promise.resolve(data1),
                equalityStrategy: 'deep'
            });

            // Set initial data
            setQueryData(['test-state-deep'], data1);
            const state1 = getQueryState(['test-state-deep']);

            // Set same structure but different reference
            setQueryData(['test-state-deep'], data2);
            const state2 = getQueryState(['test-state-deep']);

            // Data should be the same reference (deep equality preserved it)
            expect(state1.data).toBe(state2.data);
            expect(state1.data).toBe(data1);

            // Status and other state should be updated
            expect(state1.status).toBe('success');
            expect(state2.status).toBe('success');
            expect(state1.isSuccess).toBe(true);
            expect(state2.isSuccess).toBe(true);
        });

        it('should update data reference with shallow equality during setQueryData', () => {
            const data1 = { users: [{ id: 1, name: 'John' }] };
            const data2 = { users: [{ id: 1, name: 'John' }] }; // Same structure, different reference

            registerFetcher(['test-state-shallow'], {
                fetcher: () => Promise.resolve(data1),
                equalityStrategy: 'shallow'
            });

            // Set initial data
            setQueryData(['test-state-shallow'], data1);
            const state1 = getQueryState(['test-state-shallow']);

            // Set same structure but different reference
            setQueryData(['test-state-shallow'], data2);
            const state2 = getQueryState(['test-state-shallow']);

            // Data should be different references (shallow equality didn't preserve it)
            expect(state1.data).not.toBe(state2.data);
            expect(state1.data).toBe(data1);
            expect(state2.data).toBe(data2);

            // Status and other state should be updated
            expect(state1.status).toBe('success');
            expect(state2.status).toBe('success');
            expect(state1.isSuccess).toBe(true);
            expect(state2.isSuccess).toBe(true);
        });

        it('should handle loading states correctly with equality strategies', async () => {
            const data1 = { count: 1 };

            const fetcher = jest.fn().mockResolvedValue(data1);

            registerFetcher(['test-loading'], {
                fetcher,
                equalityStrategy: 'deep'
            });

            // Start fetch
            const fetchPromise = fetchQuery(['test-loading']);

            // Check loading state
            const loadingState = getQueryState(['test-loading']);
            expect(loadingState.isFetching).toBe(true);
            expect(loadingState.isLoading).toBe(true);
            expect(loadingState.status).toBe('fetching');

            // Wait for fetch to complete
            await fetchPromise;
            const finalState = getQueryState(['test-loading']);
            expect(finalState.isFetching).toBe(false);
            expect(finalState.isLoading).toBe(false);
            expect(finalState.status).toBe('success');
            expect(finalState.data).toBe(data1);
        });

        it('should handle error states correctly with equality strategies', async () => {
            const error = new Error('Network error');
            const fetcher = jest.fn().mockRejectedValue(error);

            registerFetcher(['test-error'], {
                fetcher,
                equalityStrategy: 'deep'
            });

            // Attempt fetch and wait for it to complete
            const fetchPromise = fetchQuery(['test-error']);

            // Wait for the promise to settle (either resolve or reject)
            await fetchPromise.catch(() => {
                // Expected to reject, ignore the error
            });

            // Wait a bit for the state to be updated
            await new Promise(resolve => setTimeout(resolve, 10));

            const errorState = getQueryState(['test-error']);
            expect(errorState.status).toBe('error');
            expect(errorState.isSuccess).toBe(false);
            expect(errorState.isError).toBe(true);
            expect(errorState.error).toBe(error);
        });
    });
});
