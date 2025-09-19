import {
    fetchQuery,
    getQueryState,
    subscribeQuery,
    dangerClearCache
} from '../src/queryManager';

describe('Error Promise and Subscription Behavior Tests', () => {
    beforeEach(() => {
        // Clear all state before each test
        dangerClearCache();
    });

    describe('Error Promise with Subscription Behavior', () => {
        test('should handle error promise with enabled=true: getQueryState shows loading, subscribeQuery gets 1 update for fail', async () => {
            const key = ['error-test-enabled'];
            const testError = new Error('Network error');

            // Create a fetcher that will fail
            const errorFetcher = jest.fn().mockImplementation(async () => {
                throw testError;
            });

            // 1. Get initial state with enabled=true - should show loading since enabled=true triggers immediate fetch
            const initialState = getQueryState(key, {
                fetcher: errorFetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });

            expect(initialState.isLoading).toBe(true);
            expect(initialState.isFetching).toBe(true);
            expect(initialState.isStale).toBe(false);
            expect(initialState.status).toBe('fetching');

            // 2. Set up subscription to track updates
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, { enabled: false });

            // Wait for the error to occur
            await new Promise(resolve => setTimeout(resolve, 50));

            // 3. Check final state after error
            const finalState = getQueryState(key, { enabled: false });
            expect(finalState.status).toBe('error');
            expect(finalState.isError).toBe(true);
            expect(finalState.isSuccess).toBe(false);
            expect(finalState.error).toBe(testError);
            expect(finalState.isLoading).toBe(false);
            expect(finalState.isFetching).toBe(false);
            expect(finalState.isStale).toBe(false);

            // 4. Verify subscription callback was called exactly once for the error
            expect(subscriptionCallback).toHaveBeenCalledTimes(1);
            const callbackState = subscriptionCallback.mock.calls[0][0];
            expect(callbackState.status).toBe('error');
            expect(callbackState.isError).toBe(true);

            unsubscribe();
        });

        test('should handle success promise with enabled=true: getQueryState shows loading, subscribeQuery gets 1 update for success', async () => {
            const key = ['success-test-enabled'];
            const testData = { id: 1, message: 'Success!' };

            // Create a fetcher that will succeed
            const successFetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
                return testData;
            });

            // 1. Get initial state with enabled=true - should show loading since enabled=true triggers immediate fetch
            const initialState = getQueryState(key, {
                fetcher: successFetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });
            expect(initialState.isLoading).toBe(true);
            expect(initialState.isFetching).toBe(true);
            expect(initialState.status).toBe('fetching');

            // 2. Set up subscription to track updates
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, { enabled: false });

            // Wait for the success to complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // 3. Check final state after success
            const finalState = getQueryState(key, { enabled: false });
            expect(finalState.status).toBe('success');
            expect(finalState.isError).toBe(false);
            expect(finalState.isSuccess).toBe(true);
            expect(finalState.data).toEqual(testData);
            expect(finalState.isLoading).toBe(false);
            expect(finalState.isFetching).toBe(false);
            expect(finalState.isStale).toBe(false);

            // 4. Verify subscription callback was called exactly once for the success
            expect(subscriptionCallback).toHaveBeenCalledTimes(1);
            const callbackState = subscriptionCallback.mock.calls[0][0];
            expect(callbackState.status).toBe('success');
            expect(callbackState.isSuccess).toBe(true);
            expect(callbackState.data).toEqual(testData);

            unsubscribe();
        });

        test('should handle enabled=false: getQueryState gets 3 calls with default status, subscribeQuery gets 2 updates', async () => {
            const key = ['disabled-test'];
            const testData = { id: 1, message: 'Disabled test' };

            // Create a fetcher
            const fetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return testData;
            });

            // 1. First getQueryState call with enabled=false - should show default idle state
            const state1 = getQueryState(key, {
                fetcher: fetcher,
                enabled: false,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });
            // 2. Set up subscription
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: fetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            }); // Enable in subscription
            expect(state1.status).toBe('idle');
            expect(state1.isLoading).toBe(false);
            expect(state1.isFetching).toBe(false);
            expect(state1.data).toBeUndefined();


            // 3. Second getQueryState call - should show fetching since subscription triggered fetch
            const state2 = getQueryState(key, { enabled: false });
            expect(state2.status).toBe('fetching');
            expect(state2.isLoading).toBe(true);
            expect(state2.isFetching).toBe(true);

            // 4. Wait for subscription to trigger fetch and complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // 5. Third getQueryState call - should show success after subscription triggered fetch
            const state3 = getQueryState(key, { enabled: false });
            expect(state3.status).toBe('success');
            expect(state3.isSuccess).toBe(true);
            expect(state3.data).toEqual(testData);
            expect(state3.isLoading).toBe(false);
            expect(state3.isFetching).toBe(false);
            expect(state3.isStale).toBe(false);

            // 6. Verify subscription callback was called exactly 2 times:
            // - Once when subscription was set up (initial state)
            // - Once when fetch completed (success state)
            expect(subscriptionCallback).toHaveBeenCalledTimes(2);

            const firstCallback = subscriptionCallback.mock.calls[0][0];
            const secondCallback = subscriptionCallback.mock.calls[1][0];

            // First callback should be idle or fetching state
            expect(['idle', 'fetching']).toContain(firstCallback.status);

            // Second callback should be success state
            expect(secondCallback.status).toBe('success');
            expect(secondCallback.isSuccess).toBe(true);
            expect(secondCallback.data).toEqual(testData);

            unsubscribe();
        });

        test('should handle error promise with enabled=false: getQueryState gets 3 calls, subscribeQuery gets 2 updates (idle -> error)', async () => {
            const key = ['error-disabled-test'];
            const testError = new Error('Disabled error test');

            // Create a fetcher that will fail
            const errorFetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                throw testError;
            });

            // 1. First getQueryState call with enabled=false - should show default idle state
            const state1 = getQueryState(key, {
                fetcher: errorFetcher,
                enabled: false,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });
            expect(state1.status).toBe('idle');
            expect(state1.isLoading).toBe(false);
            expect(state1.isFetching).toBe(false);
            expect(state1.data).toBeUndefined();

            // 2. Set up subscription
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: errorFetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            }); // Enable in subscription

            // 3. Second getQueryState call - should show fetching since subscription triggered fetch
            const state2 = getQueryState(key, { enabled: false });
            expect(state2.status).toBe('fetching');

            // 4. Wait for subscription to trigger fetch and error
            await new Promise(resolve => setTimeout(resolve, 50));

            // 5. Third getQueryState call - should show error after subscription triggered fetch
            const state3 = getQueryState(key, { enabled: false });
            expect(state3.status).toBe('error');
            expect(state3.isError).toBe(true);
            expect(state3.isSuccess).toBe(false);
            expect(state3.error).toBe(testError);
            expect(state3.isLoading).toBe(false);
            expect(state3.isFetching).toBe(false);
            expect(state3.isStale).toBe(false);

            // 6. Verify subscription callback was called exactly 2 times:
            // - Once when subscription was set up (initial state)
            // - Once when fetch failed (error state)
            expect(subscriptionCallback).toHaveBeenCalledTimes(2);

            const firstCallback = subscriptionCallback.mock.calls[0][0];
            const secondCallback = subscriptionCallback.mock.calls[1][0];

            // First callback should be idle or fetching state
            expect(['idle', 'fetching']).toContain(firstCallback.status);

            // Second callback should be error state
            expect(secondCallback.status).toBe('error');
            expect(secondCallback.isError).toBe(true);
            expect(secondCallback.error).toBe(testError);

            unsubscribe();
        });

        test('should handle multiple subscriptions with error promise', async () => {
            const key = ['multi-subscription-error'];
            const testError = new Error('Multi subscription error');

            // Create a fetcher that will fail
            const errorFetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                throw testError;
            });

            // Set up multiple subscriptions
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const callback3 = jest.fn();

            const unsubscribe1 = subscribeQuery(key, callback1, {
                fetcher: errorFetcher,
                enabled: true
            });
            const unsubscribe2 = subscribeQuery(key, callback2, {
                fetcher: errorFetcher,
                enabled: true
            });
            const unsubscribe3 = subscribeQuery(key, callback3, {
                fetcher: errorFetcher,
                enabled: true
            });

            // Wait for error to occur
            await new Promise(resolve => setTimeout(resolve, 50));

            // All callbacks should be called at least once, and the last call should be error
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            expect(callback3).toHaveBeenCalled();

            // All should end with error state (check the last call for each)
            const lastCall1 = callback1.mock.calls[callback1.mock.calls.length - 1][0];
            const lastCall2 = callback2.mock.calls[callback2.mock.calls.length - 1][0];
            const lastCall3 = callback3.mock.calls[callback3.mock.calls.length - 1][0];

            expect(lastCall1.status).toBe('error');
            expect(lastCall2.status).toBe('error');
            expect(lastCall3.status).toBe('error');

            // Cleanup
            unsubscribe1();
            unsubscribe2();
            unsubscribe3();
        });

        test('should handle subscription cleanup during error fetch', async () => {
            const key = ['cleanup-during-error'];
            const testError = new Error('Cleanup during error');

            // Create a slow fetcher that will fail
            const slowErrorFetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                throw testError;
            });

            // Set up subscription
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: slowErrorFetcher,
                enabled: true
            });

            // Wait a bit for fetch to start
            await new Promise(resolve => setTimeout(resolve, 50));

            // Unsubscribe before fetch completes
            unsubscribe();

            // Wait for fetch to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Callback should only be called once (for the initial state)
            // It should not be called again after unsubscribe
            expect(subscriptionCallback).toHaveBeenCalledTimes(1);

            // But the query should still complete and be in error state
            const finalState = getQueryState(key, { enabled: false });
            expect(finalState.status).toBe('error');
            expect(finalState.error).toBe(testError);
        });

        it('should handle getQueryState with enabled=false and subscribeQuery with enabled=true', async () => {
            const key = ['mixed-enabled-test'];
            const testData = { id: 1, message: 'mixed-enabled-data' };
            
            const fetcher = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return testData;
            });

            // 1. First getQueryState call with enabled=false - should show idle state
            const state1 = getQueryState(key, {
                fetcher: fetcher,
                enabled: false,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });
            expect(state1.status).toBe('idle');
            expect(state1.isLoading).toBe(false);
            expect(state1.isFetching).toBe(false);
            expect(state1.data).toBeUndefined();

            // 2. Set up subscription with enabled=true - should trigger fetch
            const subscriptionCallback = jest.fn();
            const unsubscribe = subscribeQuery(key, subscriptionCallback, {
                fetcher: fetcher,
                enabled: true,
                staleTime: 10000 // 10 seconds to prevent immediate staleness
            });

            // 3. Second getQueryState call with enabled=false - should show fetching since subscription triggered fetch
            const state2 = getQueryState(key, { enabled: false });
            expect(state2.status).toBe('fetching');
            expect(state2.isLoading).toBe(true);
            expect(state2.isFetching).toBe(true);

            // 4. Wait for subscription to trigger fetch and complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // 5. Third getQueryState call with enabled=false - should show success after subscription triggered fetch
            const state3 = getQueryState(key, { enabled: false });
            expect(state3.status).toBe('success');
            expect(state3.isSuccess).toBe(true);
            expect(state3.data).toEqual(testData);
            expect(state3.isLoading).toBe(false);
            expect(state3.isFetching).toBe(false);
            expect(state3.isStale).toBe(false);

            // 6. Verify subscription callback was called exactly 2 times:
            // - Once when subscription was set up (fetching state since enabled=true triggers immediate fetch)
            // - Once when fetch completed (success state)
            expect(subscriptionCallback).toHaveBeenCalledTimes(2);

            const firstCallback = subscriptionCallback.mock.calls[0][0];
            expect(firstCallback.status).toBe('fetching');
            expect(firstCallback.isLoading).toBe(true);
            expect(firstCallback.isFetching).toBe(true);

            const secondCallback = subscriptionCallback.mock.calls[1][0];
            expect(secondCallback.status).toBe('success');
            expect(secondCallback.isSuccess).toBe(true);
            expect(secondCallback.data).toEqual(testData);

            // Cleanup
            unsubscribe();
        });
    });
});
