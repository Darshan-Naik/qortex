import { subscribeToKey } from '../src/subscribe';
import { queryManager } from 'd-query';

describe('subscribeToKey Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state
    queryManager.cache.clear();
    queryManager.fetcherRegistry.clear();
    queryManager.subs.clear();
    
    // Default mock fetcher
    mockFetcher = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });
  });

  describe('Basic Integration', () => {
    test('should subscribe to query and trigger fetch', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // Subscribe
      const unsubscribe = subscribeToKey(['test-key'], callback, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(callbackCount).toBeGreaterThan(0);

      // Unsubscribe
      unsubscribe();
    });

    test('should handle disabled queries', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // Subscribe with disabled query
      const unsubscribe = subscribeToKey(['test-key'], callback, { enabled: false });

      // Wait
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFetcher).not.toHaveBeenCalled();
      expect(callbackCount).toBe(0);

      // Unsubscribe
      unsubscribe();
    });

    test('should handle unsubscribe correctly', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // Subscribe
      const unsubscribe = subscribeToKey(['test-key'], callback, { enabled: true });

      // Wait for initial fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      const initialCallbackCount = callbackCount;

      // Unsubscribe
      unsubscribe();

      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 100));

      // Callback count should not increase after unsubscribe
      expect(callbackCount).toBe(initialCallbackCount);
    });
  });

  describe('Options Integration', () => {
    test('should handle refetchOnSubscribe: always', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // First subscription
      const unsubscribe1 = subscribeToKey(['test-key'], callback, { 
        enabled: true,
        refetchOnSubscribe: 'always'
      });

      // Wait for first fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second subscription (should trigger refetch)
      const unsubscribe2 = subscribeToKey(['test-key'], callback, { 
        enabled: true,
        refetchOnSubscribe: 'always'
      });

      // Wait for second fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFetcher).toHaveBeenCalledTimes(2);

      // Unsubscribe both
      unsubscribe1();
      unsubscribe2();
    });

    test('should handle refetchOnSubscribe: false', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // First subscription
      const unsubscribe1 = subscribeToKey(['test-key'], callback, { 
        enabled: true,
        refetchOnSubscribe: false
      });

      // Wait for first fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second subscription (should NOT trigger refetch)
      const unsubscribe2 = subscribeToKey(['test-key'], callback, { 
        enabled: true,
        refetchOnSubscribe: false
      });

      // Wait
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Unsubscribe both
      unsubscribe1();
      unsubscribe2();
    });

    test('should handle staleTime option', async () => {
      // Register fetcher with staleTime
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 200
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // Subscribe with staleTime
      const unsubscribe = subscribeToKey(['test-key'], callback, { 
        enabled: true,
        staleTime: 200
      });

      // Wait for initial fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      // Check that data is not stale initially
      const state = queryManager.getQueryState(['test-key'], { enabled: false });
      expect(state.isStale).toBe(false);

      // Wait for data to become stale
      await new Promise(resolve => setTimeout(resolve, 100));

      const staleState = queryManager.getQueryState(['test-key'], { enabled: false });
      expect(staleState.isStale).toBe(true);

      // Unsubscribe
      unsubscribe();
    });
  });

  describe('Error Handling', () => {
    test('should handle fetcher errors', async () => {
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Test error'));

      // Register error fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: errorFetcher,
        enabled: false
      });

      let callbackCount = 0;
      const callback = () => {
        callbackCount++;
      };

      // Subscribe
      const unsubscribe = subscribeToKey(['test-key'], callback, { enabled: true });

      // Wait for error to occur
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(errorFetcher).toHaveBeenCalledTimes(1);
      expect(callbackCount).toBeGreaterThan(0);

      // Check error state
      const state = queryManager.getQueryState(['test-key'], { enabled: false });
      expect(state.isError).toBe(true);
      expect(state.error).toBeDefined();

      // Unsubscribe
      unsubscribe();
    });
  });

  describe('Multiple Subscriptions', () => {
    test('should handle multiple subscriptions to same key', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      let callback1Count = 0;
      let callback2Count = 0;

      const callback1 = () => {
        callback1Count++;
      };

      const callback2 = () => {
        callback2Count++;
      };

      // First subscription
      const unsubscribe1 = subscribeToKey(['test-key'], callback1, { enabled: true });

      // Second subscription
      const unsubscribe2 = subscribeToKey(['test-key'], callback2, { enabled: true });

      // Wait for fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(callback1Count).toBeGreaterThan(0);
      expect(callback2Count).toBeGreaterThan(0);

      // Unsubscribe both
      unsubscribe1();
      unsubscribe2();
    });

    test('should handle multiple subscriptions to different keys', async () => {
      const fetcher1 = jest.fn().mockResolvedValue({ id: 1, data: 'query1' });
      const fetcher2 = jest.fn().mockResolvedValue({ id: 2, data: 'query2' });

      // Register multiple fetchers
      queryManager.registerFetcher(['query1'], { fetcher: fetcher1, enabled: false });
      queryManager.registerFetcher(['query2'], { fetcher: fetcher2, enabled: false });

      let callback1Count = 0;
      let callback2Count = 0;

      const callback1 = () => {
        callback1Count++;
      };

      const callback2 = () => {
        callback2Count++;
      };

      // Subscribe to both queries
      const unsubscribe1 = subscribeToKey(['query1'], callback1, { enabled: true });
      const unsubscribe2 = subscribeToKey(['query2'], callback2, { enabled: true });

      // Wait for both fetches
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
      expect(callback1Count).toBeGreaterThan(0);
      expect(callback2Count).toBeGreaterThan(0);

      // Unsubscribe both
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on multiple subscribe/unsubscribe cycles', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const callback = () => {};

      // Multiple subscribe/unsubscribe cycles
      for (let i = 0; i < 5; i++) {
        const unsubscribe = subscribeToKey(['test-key'], callback, { enabled: true });
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 50));
        
        unsubscribe();
      }

      // Should not cause any issues
      expect(mockFetcher).toHaveBeenCalledTimes(5);
    });
  });
});
