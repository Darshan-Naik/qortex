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

describe('useQuery Hook', () => {
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

  describe('Basic Functionality', () => {
    test('should return query state and functions', () => {
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current).toMatchObject({
        data: mockQueryState.data,
        error: mockQueryState.error,
        status: mockQueryState.status,
        isLoading: mockQueryState.isLoading,
        isFetching: mockQueryState.isFetching,
        isError: mockQueryState.isError,
        isSuccess: mockQueryState.isSuccess,
        isStale: mockQueryState.isStale,
        updatedAt: mockQueryState.updatedAt,
        isPlaceholderData: mockQueryState.isPlaceholderData,
        refetch: expect.any(Function),
        cancel: expect.any(Function),
      });
    });

    test('should call getQueryState with correct parameters', () => {
      const key = ['test-key'];
      const options = { enabled: true, staleTime: 1000 };
      
      renderHook(() => useQuery(key, options));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(key, {
        enabled: true,
        refetchOnSubscribe: 'stale',
        fetcher: undefined,
        staleTime: 1000,
        cacheTime: undefined,
        equalityFn: undefined,
        signal: undefined,
        placeholderData: undefined,
        usePreviousDataOnError: undefined,
        usePlaceholderOnError: undefined,
      });
    });

    test('should handle undefined options', () => {
      const key = ['test-key'];
      
      renderHook(() => useQuery(key));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(key, {
        enabled: undefined,
        refetchOnSubscribe: 'stale',
        fetcher: undefined,
        staleTime: undefined,
        cacheTime: undefined,
        equalityFn: undefined,
        signal: undefined,
        placeholderData: undefined,
        usePreviousDataOnError: undefined,
        usePlaceholderOnError: undefined,
      });
    });
  });

  describe('Refetch Function', () => {
    test('should call fetchQuery when refetch is called', async () => {
      const mockResult = { id: 2, data: 'refetched-data' };
      queryManager.fetchQuery.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      await act(async () => {
        const refetchResult = await result.current.refetch();
        expect(refetchResult).toBe(mockResult);
      });
      
      expect(queryManager.fetchQuery).toHaveBeenCalledWith(['test-key'], {
        fetcher: undefined,
        equalityFn: undefined,
        staleTime: undefined,
        cacheTime: undefined,
        signal: undefined,
      });
    });

    test('should handle refetch errors gracefully', async () => {
      const mockError = new Error('Fetch failed');
      queryManager.fetchQuery.mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      await act(async () => {
        const refetchResult = await result.current.refetch();
        expect(refetchResult).toBeUndefined();
      });
      
      expect(queryManager.fetchQuery).toHaveBeenCalled();
    });

    test('should pass options to refetch', async () => {
      const options = {
        fetcher: mockFetcher,
        staleTime: 2000,
        cacheTime: 5000,
      };
      
      const { result } = renderHook(() => useQuery(['test-key'], options));
      
      await act(async () => {
        await result.current.refetch();
      });
      
      expect(queryManager.fetchQuery).toHaveBeenCalledWith(['test-key'], {
        fetcher: mockFetcher,
        equalityFn: undefined,
        staleTime: 2000,
        cacheTime: 5000,
        signal: undefined,
      });
    });
  });

  describe('Cancel Function', () => {
    test('should call cancelFetch when cancel is called', () => {
      const { result } = renderHook(() => useQuery(['test-key']));
      
      act(() => {
        result.current.cancel();
      });
      
      expect(queryManager.cancelFetch).toHaveBeenCalledWith(['test-key']);
    });
  });

  describe('State Management', () => {
    test('should handle loading state', () => {
      const loadingState = {
        ...mockQueryState,
        status: 'fetching',
        isLoading: true,
        isFetching: true,
        isSuccess: false,
      };
      queryManager.getQueryState.mockReturnValue(loadingState);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.isSuccess).toBe(false);
    });

    test('should handle error state', () => {
      const errorState = {
        ...mockQueryState,
        status: 'error',
        error: new Error('Test error'),
        isLoading: false,
        isFetching: false,
        isError: true,
        isSuccess: false,
      };
      queryManager.getQueryState.mockReturnValue(errorState);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorState.error);
      expect(result.current.isSuccess).toBe(false);
    });

    test('should handle success state', () => {
      const successState = {
        ...mockQueryState,
        status: 'success',
        data: { id: 1, name: 'test' },
        isLoading: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
      };
      queryManager.getQueryState.mockReturnValue(successState);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(successState.data);
      expect(result.current.isError).toBe(false);
    });

    test('should handle stale state', () => {
      const staleState = {
        ...mockQueryState,
        isStale: true,
      };
      queryManager.getQueryState.mockReturnValue(staleState);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current.isStale).toBe(true);
    });

    test('should handle placeholder data', () => {
      const placeholderState = {
        ...mockQueryState,
        data: { id: 0, data: 'placeholder' },
        isPlaceholderData: true,
      };
      queryManager.getQueryState.mockReturnValue(placeholderState);
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      expect(result.current.isPlaceholderData).toBe(true);
      expect(result.current.data).toEqual(placeholderState.data);
    });
  });

  describe('Options Handling', () => {
    test('should handle enabled option', () => {
      renderHook(() => useQuery(['test-key'], { enabled: false }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        enabled: false,
      }));
    });

    test('should handle refetchOnSubscribe option', () => {
      renderHook(() => useQuery(['test-key'], { refetchOnSubscribe: 'always' }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        refetchOnSubscribe: 'always',
      }));
    });

    test('should handle fetcher option', () => {
      renderHook(() => useQuery(['test-key'], { fetcher: mockFetcher }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        fetcher: mockFetcher,
      }));
    });

    test('should handle staleTime option', () => {
      renderHook(() => useQuery(['test-key'], { staleTime: 5000 }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        staleTime: 5000,
      }));
    });

    test('should handle cacheTime option', () => {
      renderHook(() => useQuery(['test-key'], { cacheTime: 10000 }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        cacheTime: 10000,
      }));
    });

    test('should handle equalityFn option', () => {
      const mockEqualityFn = jest.fn();
      renderHook(() => useQuery(['test-key'], { equalityFn: mockEqualityFn }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        equalityFn: mockEqualityFn,
      }));
    });

    test('should handle signal option', () => {
      const mockSignal = new AbortController().signal;
      renderHook(() => useQuery(['test-key'], { signal: mockSignal }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        signal: mockSignal,
      }));
    });

    test('should handle placeholderData option', () => {
      const placeholderData = { id: 0, data: 'placeholder' };
      renderHook(() => useQuery(['test-key'], { placeholderData }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        placeholderData,
      }));
    });

    test('should handle usePreviousDataOnError option', () => {
      renderHook(() => useQuery(['test-key'], { usePreviousDataOnError: true }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        usePreviousDataOnError: true,
      }));
    });

    test('should handle usePlaceholderOnError option', () => {
      renderHook(() => useQuery(['test-key'], { usePlaceholderOnError: true }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        usePlaceholderOnError: true,
      }));
    });
  });

  describe('Subscription Management', () => {
    test('should set up subscription on mount', () => {
      renderHook(() => useQuery(['test-key']));
      
      expect(mockSubscribe).toHaveBeenCalled();
    });

    test('should clean up subscription on unmount', () => {
      const { unmount } = renderHook(() => useQuery(['test-key']));
      
      // Mock the unsubscribe function
      const mockUnsubscribe = jest.fn();
      mockSubscribe.mockReturnValue(mockUnsubscribe);
      
      unmount();
      
      // The subscription should be cleaned up
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    test('should handle subscription callback', () => {
      let subscriptionCallback;
      mockSubscribe.mockImplementation((callback) => {
        subscriptionCallback = callback;
        return jest.fn(); // mock unsubscribe
      });
      
      renderHook(() => useQuery(['test-key']));
      
      // Simulate state change
      const newState = { ...mockQueryState, data: { id: 2, data: 'new-data' } };
      queryManager.getQueryState.mockReturnValue(newState);
      
      act(() => {
        subscriptionCallback();
      });
      
      // getSnapshot should be called to get new state
      expect(mockGetSnapshot).toHaveBeenCalled();
    });
  });

  describe('Memoization', () => {
    test('should memoize options', () => {
      const options = { enabled: true, staleTime: 1000 };
      
      renderHook(() => useQuery(['test-key'], options));
      
      // Should be called with memoized options
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        enabled: true,
        staleTime: 1000,
      }));
    });

    test('should handle undefined options gracefully', () => {
      renderHook(() => useQuery(['test-key'], undefined));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        enabled: undefined,
        refetchOnSubscribe: 'stale',
      }));
    });
  });

  describe('Snapshot Equality', () => {
    test('should return same reference for unchanged data', () => {
      const { result, rerender } = renderHook(() => useQuery(['test-key']));
      
      const firstResult = result.current;
      
      // Rerender with same data
      rerender();
      
      // Should return same reference if data hasn't changed
      expect(result.current).toBe(firstResult);
    });

    test('should return new reference for changed data', () => {
      const { result } = renderHook(() => useQuery(['test-key']));
      
      const firstResult = result.current;
      
      // Change the mock state
      const newState = { ...mockQueryState, data: { id: 2, data: 'new-data' } };
      queryManager.getQueryState.mockReturnValue(newState);
      
      // Simulate subscription callback
      act(() => {
        const subscriptionCallback = mockSubscribe.mock.calls[0][0];
        subscriptionCallback();
      });
      
      // Should return new reference if data has changed
      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle getQueryState errors', () => {
      queryManager.getQueryState.mockImplementation(() => {
        throw new Error('getQueryState failed');
      });
      
      expect(() => {
        renderHook(() => useQuery(['test-key']));
      }).toThrow('getQueryState failed');
    });

    test('should handle fetchQuery errors in refetch', async () => {
      queryManager.fetchQuery.mockRejectedValue(new Error('Fetch failed'));
      
      const { result } = renderHook(() => useQuery(['test-key']));
      
      await act(async () => {
        const refetchResult = await result.current.refetch();
        expect(refetchResult).toBeUndefined();
      });
    });
  });

  describe('Type Safety', () => {
    test('should handle typed fetcher', () => {
      const typedFetcher = jest.fn().mockResolvedValue({ id: 1, name: 'test' });
      
      renderHook(() => useQuery(['test-key'], { fetcher: typedFetcher }));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(['test-key'], expect.objectContaining({
        fetcher: typedFetcher,
      }));
    });

    test('should handle array keys', () => {
      const key = ['users', 1, 'profile'];
      
      renderHook(() => useQuery(key));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(key, expect.any(Object));
    });

    test('should handle string keys', () => {
      const key = 'simple-key';
      
      renderHook(() => useQuery(key));
      
      expect(queryManager.getQueryState).toHaveBeenCalledWith(key, expect.any(Object));
    });
  });
});
