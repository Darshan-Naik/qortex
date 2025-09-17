import { queryManager } from '../src/queryManager';

describe('QueryManager Core Tests', () => {
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    // Clear all state before each test
    // ⚠️ Using dangerClearCache() is safe here in test environment only
    queryManager.dangerClearCache();

    // Default mock fetcher
    mockFetcher = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });
  });

  describe('Basic Functionality', () => {
    test('should register fetcher and fetch data', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true
      });

      // Should fetch immediately when enabled
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get query datacanc
      const data = queryManager.getQueryData(key);
      expect(data).toEqual({ id: 1, data: 'test-data' });
    });

    test('should not fetch when enabled is false', () => {
      const key = ['test-key'];

      // Register fetcher with enabled: false
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Should not fetch
      expect(mockFetcher).not.toHaveBeenCalled();

      // Get query data should be undefined
      const data = queryManager.getQueryData(key);
      expect(data).toBeUndefined();
    });

    test('should handle getQueryState', () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Get initial state (without triggering fetch)
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('idle');
      expect(state.data).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.isStale).toBe(true);
    });

    test('should handle setQueryData', () => {
      const key = ['test-key'];
      const testData = { id: 1, name: 'test' };

      // Set query data
      queryManager.setQueryData(key, testData);

      // Get query data (without triggering fetch)
      const data = queryManager.getQueryData(key, { enabled: false });
      expect(data).toEqual(testData);

      // Get query state (without triggering fetch)
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.data).toEqual(testData);
      expect(state.status).toBe('success');
    });

    test('should handle refetch function', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true
      });

      // Wait for initial fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get query state and verify initial fetch
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Call refetch
      state.refetch();

      // Should trigger another fetch
      expect(mockFetcher).toHaveBeenCalledTimes(2);

      // Wait for refetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // State should still be success
      const newState = queryManager.getQueryState(key, { enabled: false });
      expect(newState.status).toBe('success');
    });

    test('should handle subscription callbacks with refetch', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true
      });

      // Wait for initial fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      // Subscribe using subscribeQuery (like React does)
      const unsubscribe = queryManager.subscribeQuery(key, callback, { enabled: false });

      // Get initial state
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Call refetch
      state.refetch();

      // Should trigger another fetch
      expect(mockFetcher).toHaveBeenCalledTimes(2);

      // Wait for refetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Callback should have been called when state changed
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('Fetching Logic', () => {
    test('should handle successful fetch', async () => {
      const key = ['test-key'];
      const testData = { id: 1, name: 'success' };
      mockFetcher.mockResolvedValue(testData);

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true
      });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const data = queryManager.getQueryData(key);
      expect(data).toEqual(testData);

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.error).toBeUndefined();
    });

    test('should handle fetch error', async () => {
      const key = ['test-key'];
      const testError = new Error('Fetch failed');
      mockFetcher.mockRejectedValue(testError);

      // Register fetcher with disabled to avoid immediate fetch
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Start a fetch manually and wait for it to fail
      try {
        await queryManager.fetchQuery(key);
      } catch (err) {
        // Expected to throw
      }

      // Wait a bit for error state to be set
      await new Promise(resolve => setTimeout(resolve, 10));

      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('error');
      expect(state.error).toBe(testError);
      expect(state.data).toBeUndefined();
    });

    test('should handle fetch completion', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Set some initial data first
      queryManager.setQueryData(key, { id: 1, name: 'initial' });

      // Start a fetch manually
      const fetchPromise = queryManager.fetchQuery(key);

      // Wait for fetch to complete
      await fetchPromise;

      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.data).toEqual({ id: 1, data: 'test-data' }); // Should have new data from fetch
    });
  });

  describe('Throttling and Inflight Checks', () => {
    test('should throttle rapid fetch calls', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Make multiple rapid calls
      queryManager.getQueryData(key, { enabled: true });
      queryManager.getQueryData(key, { enabled: true });
      queryManager.getQueryData(key, { enabled: true });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should only fetch once due to throttling
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should respect inflight requests', async () => {
      const key = ['test-key'];
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockFetcher.mockReturnValue(slowPromise);

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true
      });

      // Make another call while first is inflight
      queryManager.getQueryData(key, { enabled: true });

      // Resolve the first promise
      resolvePromise!({ id: 1, data: 'slow' });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should only fetch once due to inflight check
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('Subscription Management', () => {
    test('should handle subscribeQuery', () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe
      const unsubscribe = queryManager.subscribeQuery(key, callback, { enabled: true });

      expect(typeof unsubscribe).toBe('function');

      // Unsubscribe
      unsubscribe();

      // Should not throw
      expect(() => unsubscribe()).not.toThrow();
    });

    test('should handle callback without state parameter', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with callback that doesn't use state parameter
      const unsubscribe = queryManager.subscribeQuery(key, () => {
        callback();
      }, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Callback should have been called
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });

    test('should handle callback with state parameter', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with callback that uses state parameter
      const unsubscribe = queryManager.subscribeQuery(key, (state) => {
        callback(state);
      }, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Callback should have been called with state
      expect(callback).toHaveBeenCalled();
      const stateArg = callback.mock.calls[0][0];
      expect(stateArg).toHaveProperty('status');
      expect(stateArg).toHaveProperty('data');
      expect(stateArg).toHaveProperty('isLoading');
      expect(stateArg).toHaveProperty('isFetching');
      expect(stateArg).toHaveProperty('isSuccess');
      expect(stateArg).toHaveProperty('refetch');

      // Cleanup
      unsubscribe();
    });

    test('should handle callback with optional state parameter (ignoring state)', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with callback that has state parameter but doesn't use it
      const unsubscribe = queryManager.subscribeQuery(key, (state) => {
        // User chooses not to use the state parameter
        callback('callback-called');
      }, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Callback should have been called
      expect(callback).toHaveBeenCalledWith('callback-called');

      // Cleanup
      unsubscribe();
    });

    test('should handle callback with optional state parameter (using state)', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with callback that conditionally uses state parameter
      const unsubscribe = queryManager.subscribeQuery(key, (state) => {
        if (state && state.status === 'success') {
          callback('success-state', state.data);
        } else {
          callback('other-state');
        }
      }, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Callback should have been called with success state
      expect(callback).toHaveBeenCalled();
      const calls = callback.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('success-state');
      expect(lastCall[1]).toEqual({ id: 1, data: 'test-data' });

      // Cleanup
      unsubscribe();
    });

    test('should handle multiple callbacks with different state usage patterns', async () => {
      const key = ['test-key'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with different callback patterns
      const unsubscribe1 = queryManager.subscribeQuery(key, () => {
        callback1('no-state');
      }, { enabled: true });

      const unsubscribe2 = queryManager.subscribeQuery(key, (state) => {
        callback2('with-state', state?.status);
      }, { enabled: true });

      const unsubscribe3 = queryManager.subscribeQuery(key, (state) => {
        // Conditional usage
        if (state) {
          callback3('conditional', state.data);
        }
      }, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // All callbacks should have been called
      expect(callback1).toHaveBeenCalledWith('no-state');
      expect(callback2).toHaveBeenCalledWith('with-state', 'success');
      expect(callback3).toHaveBeenCalledWith('conditional', { id: 1, data: 'test-data' });

      // Cleanup
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    test('should notify subscribers on state changes', async () => {
      const key = ['test-key'];
      const callback = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe
      queryManager.subscribeQuery(key, callback, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should have been called due to state changes
      expect(callback).toHaveBeenCalled();
    });

    test('should handle multiple subscribers', async () => {
      const key = ['test-key'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe both
      queryManager.subscribeQuery(key, callback1, { enabled: true });
      queryManager.subscribeQuery(key, callback2, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Both should have been called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Options Integration', () => {
    test('should handle refetchOnSubscribe: always', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // First subscription - should fetch once
      queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second subscription with refetchOnSubscribe: always - should fetch again
      queryManager.subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: 'always'
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should fetch twice
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test('should handle refetchOnSubscribe: stale', async () => {
      const key = ['test-key'];

      // Register fetcher with short staleTime
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 50
      });

      // First subscription
      queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Wait for data to become stale
      await new Promise(resolve => setTimeout(resolve, 60));

      // Second subscription with refetchOnSubscribe: stale
      queryManager.subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: 'stale'
      });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should fetch twice (first + refetch when stale)
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test('should handle refetchOnSubscribe: false', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // First subscription
      queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second subscription with refetchOnSubscribe: false
      queryManager.subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: false
      });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should only fetch once
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle staleTime option', async () => {
      const key = ['test-key'];

      // Register fetcher with staleTime
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 100
      });

      // Subscribe and fetch
      queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Initially should not be stale
      let state = queryManager.getQueryState(key, { staleTime: 100 });
      expect(state.isStale).toBe(false);

      // Wait for data to become stale
      await new Promise(resolve => setTimeout(resolve, 110));

      // Should be stale now
      state = queryManager.getQueryState(key, { staleTime: 100 });
      expect(state.isStale).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined query key', () => {
      expect(() => {
        queryManager.getQueryData(undefined as any);
      }).not.toThrow();

      expect(() => {
        queryManager.getQueryState(undefined as any);
      }).not.toThrow();
    });

    test('should handle empty query key', () => {
      expect(() => {
        queryManager.getQueryData([]);
      }).not.toThrow();

      expect(() => {
        queryManager.getQueryState([]);
      }).not.toThrow();
    });

    test('should handle non-existent query', () => {
      const data = queryManager.getQueryData(['non-existent'], { enabled: false });
      expect(data).toBeUndefined();

      const state = queryManager.getQueryState(['non-existent'], { enabled: false });
      expect(state.status).toBe('idle');
      expect(state.data).toBeUndefined();
    });

    test('should handle multiple fetchers for same key', () => {
      const key = ['test-key'];
      const fetcher1 = jest.fn().mockResolvedValue({ id: 1 });
      const fetcher2 = jest.fn().mockResolvedValue({ id: 2 });

      // Register first fetcher
      queryManager.registerFetcher(key, {
        fetcher: fetcher1,
        enabled: false
      });

      // Register second fetcher (should override first)
      queryManager.registerFetcher(key, {
        fetcher: fetcher2,
        enabled: true
      });

      // Should use second fetcher
      expect(fetcher2).toHaveBeenCalledTimes(1);
      expect(fetcher1).not.toHaveBeenCalled();
    });
  });

  describe('isSuccess and isError Behavior', () => {
    test('should maintain isSuccess=true during refetch and only set false on error', async () => {
      const key = ['test-key'];
      const successData = { id: 1, data: 'success' };
      const refetchData = { id: 2, data: 'refetch-success' };

      // Start with successful fetcher
      mockFetcher.mockResolvedValue(successData);

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Initial fetch
      await queryManager.fetchQuery(key);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check initial state - should be success
      let state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.isSuccess).toBe(true);
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(successData);

      // Update fetcher to return different data for refetch
      mockFetcher.mockResolvedValue(refetchData);

      // Refetch - isSuccess should remain true during refetch
      const refetchPromise = state.refetch();

      // Check state during refetch
      state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('fetching');
      expect(state.isFetching).toBe(true);
      expect(state.isSuccess).toBe(true); // Should remain true during refetch
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(successData); // Should still have previous data

      // Wait for refetch to complete
      await refetchPromise;
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check state after successful refetch
      state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.isSuccess).toBe(true); // Should still be true after successful refetch
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(refetchData); // Should have new data

      // Now test error scenario - update fetcher to fail
      const errorData = new Error('Fetch failed');
      mockFetcher.mockRejectedValue(errorData);

      // Refetch that will fail - isSuccess should become false
      const errorRefetchPromise = state.refetch();

      // Check state during error fetch
      state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('fetching');
      expect(state.isFetching).toBe(true);
      expect(state.isSuccess).toBe(true); // Should still be true during fetch
      expect(state.isError).toBe(false);

      // Wait for error to occur
      try {
        await errorRefetchPromise;
      } catch (err) {
        // Expected to throw
      }
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check state after error
      state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('error');
      expect(state.isSuccess).toBe(false); // Should be false after error
      expect(state.isError).toBe(true); // Should be true after error
      expect(state.error).toBe(errorData);
      expect(state.data).toEqual(refetchData); // Should still have previous data

      // Test recovery - successful fetch after error
      const recoveryData = { id: 3, data: 'recovery-success' };
      mockFetcher.mockResolvedValue(recoveryData);

      // Refetch that will succeed - isSuccess should become true again
      const recoveryPromise = state.refetch();

      // Wait for recovery to complete
      await recoveryPromise;
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check state after recovery
      state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.isSuccess).toBe(true); // Should be true again after successful recovery
      expect(state.isError).toBe(false); // Should be false after successful recovery
      expect(state.data).toEqual(recoveryData); // Should have new data
    });

    test('should handle isSuccess=false on first fetch with no data', async () => {
      const key = ['test-key'];
      const errorData = new Error('First fetch failed');

      // Start with failing fetcher
      mockFetcher.mockRejectedValue(errorData);

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // First fetch that will fail
      try {
        await queryManager.fetchQuery(key);
      } catch (err) {
        // Expected to throw
      }
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check state after first fetch error
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('error');
      expect(state.isSuccess).toBe(false); // Should be false on first fetch error
      expect(state.isError).toBe(true); // Should be true on first fetch error
      expect(state.data).toBeUndefined(); // Should have no data
      expect(state.error).toBe(errorData);
    });

    test('should handle isSuccess=true when data is set manually', () => {
      const key = ['test-key'];
      const testData = { id: 1, data: 'manual-data' };

      // Set data manually
      queryManager.setQueryData(key, testData);

      // Check state after manual data set
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success');
      expect(state.isSuccess).toBe(true); // Should be true when data is set manually
      expect(state.isError).toBe(false); // Should be false when data is set manually
      expect(state.data).toEqual(testData);
    });
  });

  describe('Cache Management', () => {
    test('should handle cache persistence', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe and fetch
      const unsubscribe = queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Unsubscribe
      unsubscribe();

      // Data should still be available (no automatic eviction in current implementation)
      const data = queryManager.getQueryData(key, { enabled: false });
      expect(data).toEqual({ id: 1, data: 'test-data' });
    });

    test('should handle cache persistence with active subscribers', async () => {
      const key = ['test-key'];

      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe and fetch
      const unsubscribe = queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Data should be available
      const data = queryManager.getQueryData(key, { enabled: false });
      expect(data).toEqual({ id: 1, data: 'test-data' });

      // Unsubscribe
      unsubscribe();

      // Data should still be available (no automatic eviction in current implementation)
      const evictedData = queryManager.getQueryData(key, { enabled: false });
      expect(evictedData).toEqual({ id: 1, data: 'test-data' });
    });
  });

  describe('Developer Experience', () => {
    test('should warn when fetchQuery is called without fetcher and no data', async () => {
      const key = ['no-fetcher-key'];
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      // Try to fetch without registering a fetcher and without setting data
      const result = await queryManager.fetchQuery(key);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[qortex] No fetcher or data for key "no-fetcher-key"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Register a fetcher or set initial data')
      );
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    test('should not warn when fetchQuery is called without fetcher but updatedAt exists', async () => {
      const key = ['no-fetcher-with-updatedAt'];
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      const testData = { id: 1, name: 'test' };

      // Set data first (this sets updatedAt)
      queryManager.setQueryData(key, testData);

      // Try to fetch without registering a fetcher but with existing updatedAt
      const result = await queryManager.fetchQuery(key);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toEqual(testData);

      consoleSpy.mockRestore();
    });

  });
});
