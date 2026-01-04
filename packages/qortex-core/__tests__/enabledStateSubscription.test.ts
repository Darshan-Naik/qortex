import { queryManager } from '../src/queryManager';

// Destructuring works because all public methods are arrow functions
const { getQueryState, subscribeQuery, dangerClearCache } = queryManager;

describe('Enabled State Subscription Tests', () => {
    beforeEach(() => {
        // Clear all state before each test
        dangerClearCache();
    });

    describe('Subscription with enabled state changes', () => {
        test('should receive exactly 2 subscription callbacks: fetching and success', async () => {
            const key = ['enabled-state-test'];
            const testData = { id: 1, message: 'enabled state test data' };

            const fetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return testData;
            });

            // 1. Register query with enabled=false - should show idle state
            const initialState = getQueryState(key, {
                fetcher: fetcher,
                enabled: false,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });

            expect(initialState.status).toBe('idle');
            expect(initialState.isLoading).toBe(false);
            expect(initialState.isFetching).toBe(false);
            expect(initialState.data).toBeUndefined();

            // 2. Set up subscription with enabled=true - should trigger fetch
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: fetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });

            // 3. Wait for fetch to complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // 4. Check final state and callback count
            const finalState = getQueryState(key, { enabled: false });
            expect(finalState.status).toBe('success');
            expect(finalState.isSuccess).toBe(true);
            expect(finalState.data).toEqual(testData);

            // 5. Verify total callback count and states
            const totalCallbacks = subscriptionCallback.mock.calls.length;

            // EXPECTATION: The callback should have been called exactly 2 times:
            // - Once with fetching state (when fetch started)
            // - Once with success state (when fetch completed)
            expect(totalCallbacks).toBe(2);

            const firstCallback = subscriptionCallback.mock.calls[0][0];
            const secondCallback = subscriptionCallback.mock.calls[1][0];

            // First callback should be fetching state
            expect(firstCallback.status).toBe('fetching');
            expect(firstCallback.isLoading).toBe(true);
            expect(firstCallback.isFetching).toBe(true);

            // Second callback should be success state
            expect(secondCallback.status).toBe('success');
            expect(secondCallback.isSuccess).toBe(true);
            expect(secondCallback.data).toEqual(testData);

            // Cleanup
            unsubscribe();
        });

        test('should receive exactly 2 subscription callbacks: fetching and error', async () => {
            const key = ['error-test'];
            const testError = new Error('Test error');

            const fetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                throw testError;
            });

            // Set up subscription with enabled=true - should trigger fetch
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: fetcher,
                enabled: true,
                staleTime: 10000
            });

            // Wait for fetch to complete (with error)
            await new Promise(resolve => setTimeout(resolve, 50));

            // Check callback count and states
            const totalCallbacks = subscriptionCallback.mock.calls.length;

            // EXPECTATION: The callback should have been called exactly 2 times:
            // - Once with fetching state (when fetch started)
            // - Once with error state (when fetch failed)
            expect(totalCallbacks).toBe(2);

            const firstCallback = subscriptionCallback.mock.calls[0][0];
            const secondCallback = subscriptionCallback.mock.calls[1][0];

            // First callback should be fetching state
            expect(firstCallback.status).toBe('fetching');
            expect(firstCallback.isLoading).toBe(true);
            expect(firstCallback.isFetching).toBe(true);

            // Second callback should be error state
            expect(secondCallback.status).toBe('error');
            expect(secondCallback.isError).toBe(true);
            expect(secondCallback.error).toBe(testError);

            // Cleanup
            unsubscribe();
        });
    });
});
