import { renderHook, act } from '@testing-library/react';
import { useQuery } from '../src/useQuery';
import { queryManager } from 'd-query';

// Mock React hooks
const mockSubscribe = jest.fn();
const mockGetSnapshot = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    mockSubscribe.mockImplementation(subscribe);
    mockGetSnapshot.mockImplementation(getSnapshot);
    return getSnapshot();
  }),
  useMemo: jest.fn((fn) => fn()),
  useRef: jest.fn(() => ({ current: null })),
}));

describe('useQuery Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset React hook mocks
    mockSubscribe.mockClear();
    mockGetSnapshot.mockClear();
    mockUnsubscribe.mockClear();
    
    // Clear queryManager state
    queryManager.cache.clear();
    queryManager.fetcherRegistry.clear();
    queryManager.subs.clear();
    
    // Default mock fetcher
    mockFetcher = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });
  });

  describe('Basic Integration', () => {
    test('should register fetcher and return query state', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for fetch to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.data).toEqual({ id: 1, data: 'test-data' });
      expect(result.current.isSuccess).toBe(true);
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle disabled queries', () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: false }));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isSuccess).toBe(false);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    test('should handle refetch function', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for initial fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test('should handle cancel function', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Call cancel
      act(() => {
        result.current.cancel();
      });

      // Should not throw
      expect(result.current.cancel).toBeDefined();
    });
  });

  describe('State Management', () => {
    test('should handle loading state', async () => {
      // Register fetcher with delay
      const slowFetcher = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: 1, data: 'test-data' };
      });

      queryManager.registerFetcher(['test-key'], {
        fetcher: slowFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Check initial state (should be fetching)
      expect(result.current.isFetching).toBe(true);
      expect(result.current.isSuccess).toBe(false);

      // Wait for fetch to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isFetching).toBe(false);
    });

    test('should handle error state', async () => {
      // Register error fetcher
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Test error'));

      queryManager.registerFetcher(['test-key'], {
        fetcher: errorFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for error to occur
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Options Integration', () => {
    test('should handle staleTime option', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 200
      });

      const { result } = renderHook(() => useQuery(['test-key'], { 
        enabled: true,
        staleTime: 200
      }));

      // Wait for initial fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isStale).toBe(false);

      // Wait for data to become stale
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isStale).toBe(true);
    });

    test('should handle refetchOnSubscribe option', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result: result1 } = renderHook(() => useQuery(['test-key'], { 
        enabled: true,
        refetchOnSubscribe: 'always'
      }));

      // Wait for first fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Second useQuery with refetchOnSubscribe: 'always'
      const { result: result2 } = renderHook(() => useQuery(['test-key'], { 
        enabled: true,
        refetchOnSubscribe: 'always'
      }));

      // Wait for second fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test('should handle placeholderData option', async () => {
      const placeholderData = { id: 0, data: 'placeholder' };

      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false,
        placeholderData
      });

      const { result } = renderHook(() => useQuery(['test-key'], { 
        enabled: true,
        placeholderData
      }));

      // Wait for fetch to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.data).toEqual({ id: 1, data: 'test-data' });
      expect(result.current.isPlaceholderData).toBe(false);
    });
  });

  describe('Subscription Management', () => {
    test('should set up subscription on mount', () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      renderHook(() => useQuery(['test-key']));

      expect(mockSubscribe).toHaveBeenCalled();
    });

    test('should clean up subscription on unmount', () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { unmount } = renderHook(() => useQuery(['test-key']));

      // Mock the unsubscribe function
      const mockUnsubscribe = jest.fn();
      mockSubscribe.mockReturnValue(mockUnsubscribe);

      unmount();

      // The subscription should be cleaned up
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Multiple Queries', () => {
    test('should handle multiple independent queries', async () => {
      const fetcher1 = jest.fn().mockResolvedValue({ id: 1, data: 'query1' });
      const fetcher2 = jest.fn().mockResolvedValue({ id: 2, data: 'query2' });

      // Register multiple fetchers
      queryManager.registerFetcher(['query1'], { fetcher: fetcher1, enabled: false });
      queryManager.registerFetcher(['query2'], { fetcher: fetcher2, enabled: false });

      const { result: result1 } = renderHook(() => useQuery(['query1'], { enabled: true }));
      const { result: result2 } = renderHook(() => useQuery(['query2'], { enabled: true }));

      // Wait for both fetches to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result1.current.data).toEqual({ id: 1, data: 'query1' });
      expect(result2.current.data).toEqual({ id: 2, data: 'query2' });
      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle fetcher errors gracefully', async () => {
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Network error'));

      // Register error fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: errorFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for error to occur
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    test('should handle refetch errors gracefully', async () => {
      // Register fetcher that succeeds first, then fails
      const flakyFetcher = jest.fn()
        .mockResolvedValueOnce({ id: 1, data: 'success' })
        .mockRejectedValueOnce(new Error('Refetch failed'));

      queryManager.registerFetcher(['test-key'], {
        fetcher: flakyFetcher,
        enabled: false
      });

      const { result } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for initial success
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSuccess).toBe(true);

      // Try refetch (should fail)
      await act(async () => {
        const refetchResult = await result.current.refetch();
        expect(refetchResult).toBeUndefined();
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should not cause unnecessary re-renders', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { result, rerender } = renderHook(() => useQuery(['test-key'], { enabled: true }));

      // Wait for initial fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const firstResult = result.current;

      // Rerender with same props
      rerender();

      // Should return same reference if data hasn't changed
      expect(result.current).toBe(firstResult);
    });
  });
});
