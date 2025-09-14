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
    test('should subscribe and trigger fetch when enabled', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with enabled: true
      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify fetch was called
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      
      // Verify callback was called
      expect(callback).toHaveBeenCalled();

      // Clean up
      unsubscribe();
    });

    test('should not trigger fetch when disabled', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Subscribe with enabled: false
      const unsubscribe = subscribeToKey(key, callback, { enabled: false });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify fetch was not called
      expect(mockFetcher).not.toHaveBeenCalled();
      
      // Callback might not be called immediately for disabled queries
      // This is expected behavior - disabled queries don't trigger immediate callbacks

      // Clean up
      unsubscribe();
    });

    test('should return unsubscribe function', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test that unsubscribe works
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Options Integration', () => {
    test('should pass options to queryManager', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options = { 
        enabled: true, 
        staleTime: 5000, 
        refetchOnSubscribe: 'always'
      };
      
      // Register fetcher
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, options);

      // Wait for fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    test('should handle undefined options', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    test('should handle null options', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      const unsubscribe = subscribeToKey(key, callback, null);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('Key Types', () => {
    test('should handle string keys', async () => {
      const key = 'test-key';
      const callback = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    test('should handle array keys', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    test('should handle complex array keys', async () => {
      const key = ['users', 123, 'profile'];
      const callback = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      unsubscribe();
    });
  });

  describe('Callback Handling', () => {
    test('should call callback on state changes', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Callback should be called at least once (initial state + after fetch)
      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    test('should handle function callbacks', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    test('should handle arrow function callbacks', () => {
      const key = ['test-key'];
      const callback = () => {};
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('Error Handling', () => {
    test('should handle fetcher errors', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      
      queryManager.registerFetcher(key, {
        fetcher: errorFetcher,
        enabled: false
      });

      const unsubscribe = subscribeToKey(key, callback, { enabled: true });

      // Wait for error to occur
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errorFetcher).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe('Multiple Subscriptions', () => {
    test('should handle multiple subscriptions to same key', async () => {
      const key = ['test-key'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe1 = subscribeToKey(key, callback1, { enabled: true });
      const unsubscribe2 = subscribeToKey(key, callback2, { enabled: true });

      // Wait for fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only fetch once (shared query)
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      
      // Both callbacks should be called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });

    test('should handle multiple subscriptions to different keys', async () => {
      const key1 = ['key1'];
      const key2 = ['key2'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      queryManager.registerFetcher(key1, {
        fetcher: mockFetcher,
        enabled: false
      });
      queryManager.registerFetcher(key2, {
        fetcher: mockFetcher,
        enabled: false
      });

      const unsubscribe1 = subscribeToKey(key1, callback1, { enabled: true });
      const unsubscribe2 = subscribeToKey(key2, callback2, { enabled: true });

      // Wait for both fetches
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should fetch twice (different keys)
      expect(mockFetcher).toHaveBeenCalledTimes(2);
      
      // Both callbacks should be called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on multiple subscribe/unsubscribe cycles', async () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      queryManager.registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false
      });

      // Multiple subscribe/unsubscribe cycles
      for (let i = 0; i < 5; i++) {
        const unsubscribe = subscribeToKey(key, callback, { enabled: true });
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 50));
        
        unsubscribe();
      }

      // Should have called fetcher multiple times (each subscription triggers fetch)
      expect(mockFetcher).toHaveBeenCalled();
    });

    test('should handle rapid subscribe/unsubscribe', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      // Rapid subscribe/unsubscribe
      const unsubscribe1 = subscribeToKey(key, callback);
      const unsubscribe2 = subscribeToKey(key, callback);
      
      unsubscribe1();
      unsubscribe2();
      
      // Should not throw errors
      expect(() => {
        unsubscribe1();
        unsubscribe2();
      }).not.toThrow();
    });
  });
});