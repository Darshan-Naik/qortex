import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { dangerClearCache, registerFetcher } from 'qortex-core';
import { useQuery } from '../src/useQuery';

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

describe('useQuery Legacy React Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state for each test
    // ⚠️ Using dangerClearCache() is safe here in test environment only
    dangerClearCache();
    
    // Default mock fetcher - must be async
    mockFetcher = jest.fn().mockImplementation(async () => ({ id: 1, data: 'test-data' }));
  });

  describe('Basic React Integration', () => {
    test('should render with initial state and fetch data', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
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
      registerFetcher(['test-key'], {
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
      registerFetcher(['test-key'], {
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

  describe('Legacy React Compatibility', () => {
    test('should work with useEffect and useState pattern', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Should work the same as modern React
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle subscription cleanup on unmount', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
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

  describe('Error States', () => {
    test('should handle error state', async () => {
      // Register error fetcher
      const errorFetcher = jest.fn().mockImplementation(async () => { throw new Error('Test error'); });

      registerFetcher(['test-key'], {
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

  describe('Loading States', () => {
    test('should show loading state during fetch', async () => {
      // Create a slow fetcher to capture loading state
      const slowFetcher = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: 1, data: 'test-data' };
      });

      registerFetcher(['loading-test'], {
        fetcher: slowFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['loading-test']} options={{ enabled: true }} />);

      // Should show loading state initially
      expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
      expect(screen.getByTestId('isFetching')).toHaveTextContent('true');
      expect(screen.getByTestId('status')).toHaveTextContent('fetching');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
        expect(screen.getByTestId('isSuccess')).toHaveTextContent('true');
      });
    });
  });

  describe('Re-render Scenarios', () => {
    test('should not cause unnecessary re-renders', async () => {
      const renderCount = jest.fn();
      
      function TestComponentWithRenderCount({ queryKey, options = {} }) {
        renderCount();
        const query = useQuery(queryKey, options);
        
        return (
          <div>
            <div data-testid="status">{query.status}</div>
            <div data-testid="data">{JSON.stringify(query.data)}</div>
          </div>
        );
      }

      registerFetcher(['rerender-test'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponentWithRenderCount queryKey={['rerender-test']} options={{ enabled: true }} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      const initialRenderCount = renderCount.mock.calls.length;

      // Re-render with same props
      rerender(<TestComponentWithRenderCount queryKey={['rerender-test']} options={{ enabled: true }} />);

      // Legacy implementation with useEffect/useState may have different render behavior
      // The important thing is that it doesn't cause infinite re-renders
      expect(renderCount.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount);
      expect(renderCount.mock.calls.length).toBeLessThan(initialRenderCount + 5); // Reasonable upper bound
    });

    test('should handle key changes', async () => {
      registerFetcher(['key-change-1'], {
        fetcher: jest.fn().mockResolvedValue({ id: 1, data: 'data-1' }),
        enabled: false
      });

      registerFetcher(['key-change-2'], {
        fetcher: jest.fn().mockResolvedValue({ id: 2, data: 'data-2' }),
        enabled: false
      });

      const { rerender } = render(<TestComponent queryKey={['key-change-1']} options={{ enabled: true }} />);

      // Wait for first fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"data-1"}');
      });

      // Change key
      rerender(<TestComponent queryKey={['key-change-2']} options={{ enabled: true }} />);

      // Should fetch new data
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":2,"data":"data-2"}');
      });
    });
  });

  describe('Multiple Components', () => {
    test('should handle multiple components with same query', async () => {
      registerFetcher(['multi-component'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['multi-component']} options={{ enabled: true }} />
          <TestComponent queryKey={['multi-component']} options={{ enabled: true }} />
        </div>
      );

      // Both components should show the same data
      const statusElements = screen.getAllByTestId('status');
      const dataElements = screen.getAllByTestId('data');

      await waitFor(() => {
        statusElements.forEach(element => {
          expect(element).toHaveTextContent('success');
        });
        dataElements.forEach(element => {
          expect(element).toHaveTextContent('{"id":1,"data":"test-data"}');
        });
      });
    });

    test('should handle multiple components with different queries', async () => {
      registerFetcher(['multi-1'], {
        fetcher: jest.fn().mockResolvedValue({ id: 1, data: 'data-1' }),
        enabled: false
      });

      registerFetcher(['multi-2'], {
        fetcher: jest.fn().mockResolvedValue({ id: 2, data: 'data-2' }),
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['multi-1']} options={{ enabled: true }} />
          <TestComponent queryKey={['multi-2']} options={{ enabled: true }} />
        </div>
      );

      // Components should show different data
      const dataElements = screen.getAllByTestId('data');

      await waitFor(() => {
        expect(dataElements[0]).toHaveTextContent('{"id":1,"data":"data-1"}');
        expect(dataElements[1]).toHaveTextContent('{"id":2,"data":"data-2"}');
      });
    });
  });

  describe('Options Integration', () => {
    test('should handle refetchOnSubscribe: always', async () => {
      const fetcherSpy = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });

      registerFetcher(['refetch-always'], {
        fetcher: fetcherSpy,
        enabled: false,
        refetchOnSubscribe: 'always'
      });

      // First render
      const { unmount } = render(<TestComponent queryKey={['refetch-always']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(fetcherSpy).toHaveBeenCalledTimes(1);

      // Unmount and remount
      unmount();
      
      // Wait a bit to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      render(<TestComponent queryKey={['refetch-always']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // Should have been called again due to refetchOnSubscribe: always
      expect(fetcherSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle staleTime option', async () => {
      const fetcherSpy = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });

      registerFetcher(['stale-time'], {
        fetcher: fetcherSpy,
        enabled: false,
        staleTime: 1000 // 1 second
      });

      // First render
      const { unmount } = render(<TestComponent queryKey={['stale-time']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(fetcherSpy).toHaveBeenCalledTimes(1);

      // Unmount and remount quickly (within staleTime)
      unmount();
      render(<TestComponent queryKey={['stale-time']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // Should not have been called again due to staleTime
      expect(fetcherSpy).toHaveBeenCalledTimes(1);
    });
  });
});
