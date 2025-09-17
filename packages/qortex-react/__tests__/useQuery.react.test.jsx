import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { queryManager ,useQuery} from '../src/index';

// Test component that uses useQuery
function TestComponent({ queryKey, options = {} }) {
  const query = useQuery(queryKey, options);
  
  return (
    <div>
      <div data-testid="status">{query.status}</div>
      <div data-testid="isLoading">{query.isLoading.toString()}</div>
      <div data-testid="isFetching">{query.isFetching.toString()}</div>
      <div data-testid="isSuccess">{query.isSuccess.toString()}</div>
      <div data-testid="isError">{query.isError.toString()}</div>
      <div data-testid="isStale">{query.isStale.toString()}</div>
      <div data-testid="data">{JSON.stringify(query.data)}</div>
      <div data-testid="error">{query.error?.message || 'null'}</div>
      <button 
        data-testid="refetch" 
        onClick={() => query.refetch()}
      >
        Refetch
      </button>
    </div>
  );
}

describe('useQuery React Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state for each test
    // ⚠️ Using dangerClearCache() is safe here in test environment only
    queryManager.dangerClearCache();
    
    // Default mock fetcher
    mockFetcher = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });
  });

  describe('Basic React Integration', () => {
    test('should render with initial state and fetch data', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Initial state should be fetching since enabled=true triggers immediate fetch
      expect(screen.getByTestId('status')).toHaveTextContent('fetching');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true'); // true for first fetch
      expect(screen.getByTestId('isFetching')).toHaveTextContent('true');
      expect(screen.getByTestId('isSuccess')).toHaveTextContent('false');
      expect(screen.getByTestId('isError')).toHaveTextContent('false');

      // Wait for fetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('isSuccess')).toHaveTextContent('true');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('isFetching')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle disabled queries', () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: false }} />);

      // Should remain in idle state
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('isFetching')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('');
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    test('should handle refetch function', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // Click refetch button
      act(() => {
        screen.getByTestId('refetch').click();
      });

      // Wait for refetch to complete
      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });
    });

  });

  describe('Loading States', () => {
    test('should show loading state during fetch', async () => {
      // Register slow fetcher
      const slowFetcher = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: 1, data: 'test-data' };
      });

      queryManager.registerFetcher(['test-key'], {
        fetcher: slowFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Should show fetching state initially
      expect(screen.getByTestId('status')).toHaveTextContent('fetching');
      expect(screen.getByTestId('isFetching')).toHaveTextContent('true');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('isFetching')).toHaveTextContent('false');
    });
  });

  describe('Error States', () => {
    test('should handle error state', async () => {
      // Register error fetcher
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Test error'));

      queryManager.registerFetcher(['test-key'], {
        fetcher: errorFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for error to occur
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error');
      });

      expect(screen.getByTestId('isError')).toHaveTextContent('true');
      expect(screen.getByTestId('isSuccess')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Test error');
    });
  });

  describe('Re-render Scenarios', () => {
    test('should not cause unnecessary re-renders', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      const initialCallCount = mockFetcher.mock.calls.length;

      // Rerender with same props
      rerender(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not trigger additional fetches
      expect(mockFetcher).toHaveBeenCalledTimes(initialCallCount);
    });

    test('should handle key changes', async () => {
      // Register fetchers for different keys
      const fetcher1 = jest.fn().mockResolvedValue({ id: 1, data: 'query1' });
      const fetcher2 = jest.fn().mockResolvedValue({ id: 2, data: 'query2' });

      queryManager.registerFetcher(['query1'], { fetcher: fetcher1, enabled: false });
      queryManager.registerFetcher(['query2'], { fetcher: fetcher2, enabled: false });

      const { rerender } = render(<TestComponent queryKey={['query1']} options={{ enabled: true }} />);

      // Wait for first fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"query1"}');
      });

      // Change key
      rerender(<TestComponent queryKey={['query2']} options={{ enabled: true }} />);

      // Wait for second fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":2,"data":"query2"}');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Components', () => {
    test('should handle multiple components with same query', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['test-key']} options={{ enabled: true }} />
          <TestComponent queryKey={['test-key']} options={{ enabled: true }} />
        </div>
      );

      // Wait for fetch to complete
      await waitFor(() => {
        expect(screen.getAllByTestId('status')[0]).toHaveTextContent('success');
        expect(screen.getAllByTestId('status')[1]).toHaveTextContent('success');
      });

      // Should only fetch once for both components
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple components with different queries', async () => {
      // Register different fetchers
      const fetcher1 = jest.fn().mockResolvedValue({ id: 1, data: 'query1' });
      const fetcher2 = jest.fn().mockResolvedValue({ id: 2, data: 'query2' });

      queryManager.registerFetcher(['query1'], { fetcher: fetcher1, enabled: false });
      queryManager.registerFetcher(['query2'], { fetcher: fetcher2, enabled: false });

      render(
        <div>
          <TestComponent queryKey={['query1']} options={{ enabled: true }} />
          <TestComponent queryKey={['query2']} options={{ enabled: true }} />
        </div>
      );

      // Wait for both fetches to complete
      await waitFor(() => {
        expect(screen.getAllByTestId('status')[0]).toHaveTextContent('success');
        expect(screen.getAllByTestId('status')[1]).toHaveTextContent('success');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Options Integration', () => {
    test('should handle refetchOnSubscribe: always', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      // First component subscription
      const { unmount } = render(
        <TestComponent 
          queryKey={['test-key']} 
          options={{ enabled: true, refetchOnSubscribe: 'always' }} 
        />
      );

      // Wait for first fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Unmount first component
      unmount();

      // Wait for throttle period to pass (100ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second component subscription (new subscription should trigger refetch)
      render(
        <TestComponent 
          queryKey={['test-key']} 
          options={{ enabled: true, refetchOnSubscribe: 'always' }} 
        />
      );

      // Wait for second fetch
      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });
    });

    test('should handle staleTime option', async () => {
      // Register fetcher with staleTime
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 200
      });

      const { unmount } = render(
        <TestComponent 
          queryKey={['test-key']} 
          options={{ enabled: true, staleTime: 200 }} 
        />
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // Initially should not be stale
      expect(screen.getByTestId('isStale')).toHaveTextContent('false');

      // Unmount component
      unmount();

      // Wait for data to become stale
      await new Promise(resolve => setTimeout(resolve, 250));

      // Re-render component - this should trigger a check for staleness
      render(
        <TestComponent 
          queryKey={['test-key']} 
          options={{ enabled: true, staleTime: 200 }} 
        />
      );

      // Should be stale now
      expect(screen.getByTestId('isStale')).toHaveTextContent('true');
    });
  });

  describe('Subscription Management', () => {
    test('should clean up subscriptions on unmount', async () => {
      // Register fetcher
      queryManager.registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { unmount } = render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // Unmount component
      unmount();

      // Should not cause any issues
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });
});
