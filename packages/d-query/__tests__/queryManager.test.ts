import { queryManager } from '../src/queryManager';

describe('QueryManager Core Tests', () => {
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    // Clear all state before each test
    queryManager.cache.clear();
    queryManager.fetcherRegistry.clear();
    queryManager.subs.clear();
    
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
      queryManager.setQueryData(key, { data: testData });
      
      // Get query data (without triggering fetch)
      const data = queryManager.getQueryData(key, { enabled: false });
      expect(data).toEqual(testData);
      
      // Get query state (without triggering fetch)
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.data).toEqual(testData);
      expect(state.status).toBe('success');
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

    test('should handle fetch cancellation', async () => {
      const key = ['test-key'];
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockFetcher.mockReturnValue(slowPromise);
      
      // Register fetcher with disabled to avoid immediate fetch
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Set some initial data first
      queryManager.setQueryData(key, { data: { id: 1, name: 'initial' } });
      
      // Start a fetch manually
      queryManager.fetchQuery(key);
      
      // Cancel the fetch immediately
      queryManager.cancelFetch(key);
      
      // Wait a bit for cancellation to take effect
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const state = queryManager.getQueryState(key, { enabled: false });
      expect(state.status).toBe('success'); // Status should be success (previous state) after cancellation
      expect(state.data).toEqual({ id: 1, name: 'initial' }); // Previous data should be preserved
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
      let state = queryManager.getQueryState(key);
      expect(state.isStale).toBe(false);
      
      // Wait for data to become stale
      await new Promise(resolve => setTimeout(resolve, 110));
      
      // Should be stale now
      state = queryManager.getQueryState(key);
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

  describe('Cache Management', () => {
    test('should handle cache eviction', async () => {
      const key = ['test-key'];
      
      // Register fetcher with short cacheTime
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        cacheTime: 50
      });

      // Subscribe and fetch
      const unsubscribe = queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Unsubscribe
      unsubscribe();
      
      // Wait for cache eviction
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Data should be evicted
      const data = queryManager.getQueryData(key);
      expect(data).toBeUndefined();
    });

    test('should handle cache persistence with active subscribers', async () => {
      const key = ['test-key'];
      
      // Register fetcher with short cacheTime
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        cacheTime: 50
      });

      // Subscribe and fetch
      const unsubscribe = queryManager.subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Wait for cache time to expire
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Data should still be there due to active subscription
      const data = queryManager.getQueryData(key);
      expect(data).toEqual({ id: 1, data: 'test-data' });
      
      // Unsubscribe
      unsubscribe();
      
      // Wait for cache eviction
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Now data should be evicted
      const evictedData = queryManager.getQueryData(key);
      expect(evictedData).toBeUndefined();
    });
  });
});
