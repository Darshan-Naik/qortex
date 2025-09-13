import { subscribeToKey } from '../src/subscribe';
import { queryManager } from 'd-query';

describe('subscribeToKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear queryManager state
    queryManager.cache.clear();
    queryManager.fetcherRegistry.clear();
    queryManager.subs.clear();
  });

  describe('Basic Functionality', () => {
    test('should call queryManager methods with correct parameters', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options = { enabled: true, staleTime: 1000 };
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback, options);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options);
      
      // Test unsubscribe function
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(queryManager.onUnsubscribe).toHaveBeenCalledWith(key);
    });

    test('should handle undefined options', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
      
      unsubscribe();
      expect(queryManager.onUnsubscribe).toHaveBeenCalledWith(key);
    });

    test('should return unsubscribe function', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Subscription Lifecycle', () => {
    test('should call onSubscribe before subscribeQuery', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options = { enabled: true };
      
      subscribeToKey(key, callback, options);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledBefore(queryManager.subscribeQuery);
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options);
    });

    test('should call onUnsubscribe after unsubscribe', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback);
      
      unsubscribe();
      
      expect(mockUnsubscribe).toHaveBeenCalledBefore(queryManager.onUnsubscribe);
      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(queryManager.onUnsubscribe).toHaveBeenCalledWith(key);
    });

    test('should handle multiple unsubscribe calls', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback);
      
      // Call unsubscribe multiple times
      unsubscribe();
      unsubscribe();
      unsubscribe();
      
      // Should only call the internal unsubscribe once
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(queryManager.onUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Options Handling', () => {
    test('should pass all options to subscribeQuery', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options = {
        enabled: true,
        refetchOnSubscribe: 'always',
        fetcher: jest.fn(),
        staleTime: 2000,
        cacheTime: 5000,
        equalityFn: jest.fn(),
        signal: new AbortController().signal,
        placeholderData: { id: 0 },
        usePreviousDataOnError: true,
        usePlaceholderOnError: true,
      };
      
      subscribeToKey(key, callback, options);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options);
    });

    test('should handle empty options object', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options = {};
      
      subscribeToKey(key, callback, options);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options);
    });

    test('should handle null options', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      subscribeToKey(key, callback, null);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, null);
    });
  });

  describe('Key Types', () => {
    test('should handle string keys', () => {
      const key = 'simple-key';
      const callback = jest.fn();
      
      subscribeToKey(key, callback);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });

    test('should handle array keys', () => {
      const key = ['users', 1, 'profile'];
      const callback = jest.fn();
      
      subscribeToKey(key, callback);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });

    test('should handle complex array keys', () => {
      const key = ['api', 'v1', 'users', { id: 1 }, 'posts'];
      const callback = jest.fn();
      
      subscribeToKey(key, callback);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });
  });

  describe('Callback Handling', () => {
    test('should handle function callbacks', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      subscribeToKey(key, callback);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });

    test('should handle arrow function callbacks', () => {
      const key = ['test-key'];
      const callback = () => console.log('callback');
      
      subscribeToKey(key, callback);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });

    test('should handle bound method callbacks', () => {
      const key = ['test-key'];
      const obj = {
        method: jest.fn(),
      };
      const callback = obj.method.bind(obj);
      
      subscribeToKey(key, callback);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, undefined);
    });
  });

  describe('Error Handling', () => {
    test('should handle onSubscribe errors', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      queryManager.onSubscribe.mockImplementation(() => {
        throw new Error('onSubscribe failed');
      });
      
      expect(() => {
        subscribeToKey(key, callback);
      }).toThrow('onSubscribe failed');
    });

    test('should handle subscribeQuery errors', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      
      queryManager.subscribeQuery.mockImplementation(() => {
        throw new Error('subscribeQuery failed');
      });
      
      expect(() => {
        subscribeToKey(key, callback);
      }).toThrow('subscribeQuery failed');
    });

    test('should handle unsubscribe errors', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn().mockImplementation(() => {
        throw new Error('unsubscribe failed');
      });
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(() => {
        unsubscribe();
      }).toThrow('unsubscribe failed');
    });

    test('should handle onUnsubscribe errors', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      queryManager.onUnsubscribe.mockImplementation(() => {
        throw new Error('onUnsubscribe failed');
      });
      
      const unsubscribe = subscribeToKey(key, callback);
      
      expect(() => {
        unsubscribe();
      }).toThrow('onUnsubscribe failed');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle multiple subscriptions to same key', () => {
      const key = ['test-key'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();
      
      queryManager.subscribeQuery
        .mockReturnValueOnce(mockUnsubscribe1)
        .mockReturnValueOnce(mockUnsubscribe2);
      
      const unsubscribe1 = subscribeToKey(key, callback1);
      const unsubscribe2 = subscribeToKey(key, callback2);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledTimes(2);
      expect(queryManager.subscribeQuery).toHaveBeenCalledTimes(2);
      
      unsubscribe1();
      unsubscribe2();
      
      expect(mockUnsubscribe1).toHaveBeenCalled();
      expect(mockUnsubscribe2).toHaveBeenCalled();
      expect(queryManager.onUnsubscribe).toHaveBeenCalledTimes(2);
    });

    test('should handle multiple subscriptions to different keys', () => {
      const key1 = ['key1'];
      const key2 = ['key2'];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();
      
      queryManager.subscribeQuery
        .mockReturnValueOnce(mockUnsubscribe1)
        .mockReturnValueOnce(mockUnsubscribe2);
      
      const unsubscribe1 = subscribeToKey(key1, callback1);
      const unsubscribe2 = subscribeToKey(key2, callback2);
      
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key1);
      expect(queryManager.onSubscribe).toHaveBeenCalledWith(key2);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key1, callback1, undefined);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key2, callback2, undefined);
      
      unsubscribe1();
      unsubscribe2();
      
      expect(queryManager.onUnsubscribe).toHaveBeenCalledWith(key1);
      expect(queryManager.onUnsubscribe).toHaveBeenCalledWith(key2);
    });

    test('should handle subscription with different options', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const options1 = { enabled: true, staleTime: 1000 };
      const options2 = { enabled: false, refetchOnSubscribe: 'always' };
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();
      
      queryManager.subscribeQuery
        .mockReturnValueOnce(mockUnsubscribe1)
        .mockReturnValueOnce(mockUnsubscribe2);
      
      const unsubscribe1 = subscribeToKey(key, callback, options1);
      const unsubscribe2 = subscribeToKey(key, callback, options2);
      
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options1);
      expect(queryManager.subscribeQuery).toHaveBeenCalledWith(key, callback, options2);
      
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on multiple subscribe/unsubscribe cycles', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      // Multiple subscribe/unsubscribe cycles
      for (let i = 0; i < 10; i++) {
        const unsubscribe = subscribeToKey(key, callback);
        unsubscribe();
      }
      
      expect(queryManager.onSubscribe).toHaveBeenCalledTimes(10);
      expect(queryManager.subscribeQuery).toHaveBeenCalledTimes(10);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(10);
      expect(queryManager.onUnsubscribe).toHaveBeenCalledTimes(10);
    });

    test('should handle rapid subscribe/unsubscribe', () => {
      const key = ['test-key'];
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      queryManager.subscribeQuery.mockReturnValue(mockUnsubscribe);
      
      // Rapid subscribe/unsubscribe
      const unsubscribe1 = subscribeToKey(key, callback);
      const unsubscribe2 = subscribeToKey(key, callback);
      unsubscribe1();
      const unsubscribe3 = subscribeToKey(key, callback);
      unsubscribe2();
      unsubscribe3();
      
      expect(queryManager.onSubscribe).toHaveBeenCalledTimes(3);
      expect(queryManager.subscribeQuery).toHaveBeenCalledTimes(3);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
      expect(queryManager.onUnsubscribe).toHaveBeenCalledTimes(3);
    });
  });
});
