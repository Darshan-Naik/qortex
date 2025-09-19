import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useQueryData, useQuery, dangerClearCache, registerFetcher, getQueryState} from '../src/index';

// Test component that uses useQueryData
function TestComponent({ queryKey, options = {} }) {
  const data = useQueryData(queryKey, options);
  
  return (
    <div>
      <div data-testid="data">{JSON.stringify(data)}</div>
      <div data-testid="data-type">{typeof data}</div>
      <div data-testid="is-undefined">{data === undefined ? 'true' : 'false'}</div>
    </div>
  );
}

// Test component that uses both useQuery and useQueryData for comparison
function ComparisonComponent({ queryKey, options = {} }) {
  const query = useQuery(queryKey, options);
  const data = useQueryData(queryKey, options);
  
  return (
    <div>
      <div data-testid="query-data">{JSON.stringify(query.data)}</div>
      <div data-testid="hook-data">{JSON.stringify(data)}</div>
      <div data-testid="data-match">{JSON.stringify(query.data) === JSON.stringify(data) ? 'true' : 'false'}</div>
    </div>
  );
}

describe('useQueryData React Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state for each test
    // ⚠️ Using dangerClearCache() is safe here in test environment only
dangerClearCache();
    
    // Default mock fetcher - must be async
    mockFetcher = jest.fn().mockImplementation(async () => ({ id: 1, data: 'test-data' }));
  });

  describe('Basic Data Retrieval', () => {
    test('should return undefined initially when no data is available', () => {
      // Register fetcher but don't trigger fetch
registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: false }} />);

      expect(screen.getByTestId('data')).toHaveTextContent('');
      expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    test('should return data after successful fetch', async () => {
      // Register fetcher
registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Initially should be undefined
      expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');

      // Wait for fetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      expect(screen.getByTestId('is-undefined')).toHaveTextContent('false');
      expect(screen.getByTestId('data-type')).toHaveTextContent('object');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should return cached data on subsequent renders', async () => {
      // Register fetcher
registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Rerender component
      rerender(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Should still have the same data without additional fetch
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Types and Edge Cases', () => {
    test('should handle null data', async () => {
      const nullFetcher = jest.fn().mockImplementation(async () => null);

registerFetcher(['null-key'], {
        fetcher: nullFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['null-key']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('');
      });

      expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');
      expect(screen.getByTestId('data-type')).toHaveTextContent('undefined');
    });

    test('should handle primitive data types', async () => {
      const stringFetcher = jest.fn().mockImplementation(async () => 'hello world');
      const numberFetcher = jest.fn().mockImplementation(async () => 42);
      const booleanFetcher = jest.fn().mockImplementation(async () => true);

registerFetcher(['string-key'], { fetcher: stringFetcher, enabled: false });
registerFetcher(['number-key'], { fetcher: numberFetcher, enabled: false });
registerFetcher(['boolean-key'], { fetcher: booleanFetcher, enabled: false });

      // Test string
      const { rerender } = render(<TestComponent queryKey={['string-key']} options={{ enabled: true }} />);
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('"hello world"');
      });
      expect(screen.getByTestId('data-type')).toHaveTextContent('string');

      // Test number
      rerender(<TestComponent queryKey={['number-key']} options={{ enabled: true }} />);
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('42');
      });
      expect(screen.getByTestId('data-type')).toHaveTextContent('number');

      // Test boolean
      rerender(<TestComponent queryKey={['boolean-key']} options={{ enabled: true }} />);
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('data-type')).toHaveTextContent('boolean');
    });

    test('should handle complex nested objects', async () => {
      const complexData = {
        user: {
          id: 1,
          name: 'John Doe',
          profile: {
            avatar: 'https://example.com/avatar.jpg',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00Z',
          tags: ['user', 'premium']
        }
      };

      const complexFetcher = jest.fn().mockImplementation(async () => complexData);

registerFetcher(['complex-key'], {
        fetcher: complexFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['complex-key']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(complexData));
      });

      expect(screen.getByTestId('data-type')).toHaveTextContent('object');
    });
  });

  describe('Comparison with useQuery', () => {
    test('should return same data as useQuery.data', async () => {
registerFetcher(['comparison-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<ComparisonComponent queryKey={['comparison-key']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data-match')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('query-data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(screen.getByTestId('hook-data')).toHaveTextContent('{"id":1,"data":"test-data"}');
    });

    test('should stay in sync when data changes', async () => {
      let resolveFirstFetch;
      const firstFetchPromise = new Promise(resolve => {
        resolveFirstFetch = resolve;
      });

      const changingFetcher = jest.fn()
        .mockReturnValueOnce(firstFetchPromise)
        .mockImplementationOnce(async () => ({ id: 2, data: 'updated-data' }));

registerFetcher(['changing-key'], {
        fetcher: changingFetcher,
        enabled: false
      });

      render(<ComparisonComponent queryKey={['changing-key']} options={{ enabled: true }} />);

      // Resolve first fetch
      act(() => {
        resolveFirstFetch({ id: 1, data: 'initial-data' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('data-match')).toHaveTextContent('true');
      });

      // Trigger refetch
      const query = getQueryState(['changing-key']);
      act(() => {
        query.refetch();
      });

      await waitFor(() => {
        expect(screen.getByTestId('query-data')).toHaveTextContent('{"id":2,"data":"updated-data"}');
        expect(screen.getByTestId('hook-data')).toHaveTextContent('{"id":2,"data":"updated-data"}');
        expect(screen.getByTestId('data-match')).toHaveTextContent('true');
      });
    });
  });

  describe('Error Scenarios', () => {
    test('should return undefined when query is in error state', async () => {
      const errorFetcher = jest.fn().mockImplementation(async () => { throw new Error('Test error'); });

registerFetcher(['error-key'], {
        fetcher: errorFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['error-key']} options={{ enabled: true }} />);

      // Wait for error to occur
      await waitFor(() => {
        expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('data')).toHaveTextContent('');
    });

    test('should return undefined for non-existent query keys', () => {
      render(<TestComponent queryKey={['non-existent-key']} />);

      expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');
      expect(screen.getByTestId('data')).toHaveTextContent('');
    });
  });

  describe('Performance and Memoization', () => {
    test('should not cause unnecessary re-renders', async () => {
      let renderCount = 0;
      
      function TestComponentWithRenderCount({ queryKey, options = {} }) {
        renderCount++;
        const data = useQueryData(queryKey, options);
        
        return (
          <div>
            <div data-testid="data">{JSON.stringify(data)}</div>
            <div data-testid="render-count">{renderCount}</div>
          </div>
        );
      }

registerFetcher(['performance-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(
        <TestComponentWithRenderCount queryKey={['performance-key']} options={{ enabled: true }} />
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      const initialRenderCount = renderCount;

      // Rerender with same props
      rerender(
        <TestComponentWithRenderCount queryKey={['performance-key']} options={{ enabled: true }} />
      );

      // Should not cause additional renders due to memoization
      expect(renderCount).toBe(initialRenderCount + 1); // Only one additional render for rerender
    });

    test('should handle key changes efficiently', async () => {
      const fetcher1 = jest.fn().mockImplementation(async () => ({ id: 1, data: 'query1' }));
      const fetcher2 = jest.fn().mockImplementation(async () => ({ id: 2, data: 'query2' }));

registerFetcher(['key1'], { fetcher: fetcher1, enabled: false });
registerFetcher(['key2'], { fetcher: fetcher2, enabled: false });

      const { rerender } = render(<TestComponent queryKey={['key1']} options={{ enabled: true }} />);

      // Wait for first fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"query1"}');
      });

      // Change key
      rerender(<TestComponent queryKey={['key2']} options={{ enabled: true }} />);

      // Wait for second fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":2,"data":"query2"}');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Components', () => {
    test('should handle multiple components with same query key', async () => {
registerFetcher(['shared-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['shared-key']} options={{ enabled: true }} />
          <TestComponent queryKey={['shared-key']} options={{ enabled: true }} />
        </div>
      );

      // Wait for fetch to complete
      await waitFor(() => {
        const dataElements = screen.getAllByTestId('data');
        expect(dataElements[0]).toHaveTextContent('{"id":1,"data":"test-data"}');
        expect(dataElements[1]).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Should only fetch once for both components
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple components with different query keys', async () => {
      const fetcher1 = jest.fn().mockImplementation(async () => ({ id: 1, data: 'query1' }));
      const fetcher2 = jest.fn().mockImplementation(async () => ({ id: 2, data: 'query2' }));

registerFetcher(['multi-key1'], { fetcher: fetcher1, enabled: false });
registerFetcher(['multi-key2'], { fetcher: fetcher2, enabled: false });

      render(
        <div>
          <TestComponent queryKey={['multi-key1']} options={{ enabled: true }} />
          <TestComponent queryKey={['multi-key2']} options={{ enabled: true }} />
        </div>
      );

      // Wait for both fetches to complete
      await waitFor(() => {
        const dataElements = screen.getAllByTestId('data');
        expect(dataElements[0]).toHaveTextContent('{"id":1,"data":"query1"}');
        expect(dataElements[1]).toHaveTextContent('{"id":2,"data":"query2"}');
      });

      expect(fetcher1).toHaveBeenCalledTimes(1);
      expect(fetcher2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Subscription Management', () => {
    test('should clean up subscriptions on unmount', async () => {
registerFetcher(['cleanup-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { unmount } = render(<TestComponent queryKey={['cleanup-key']} options={{ enabled: true }} />);

      // Wait for fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Unmount component
      unmount();

      // Should not cause any issues
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should handle rapid mount/unmount cycles', async () => {
registerFetcher(['rapid-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      // Mount
      const { unmount } = render(<TestComponent queryKey={['rapid-key']} options={{ enabled: true }} />);
      
      // Unmount quickly
      unmount();
      
      // Mount again
      render(<TestComponent queryKey={['rapid-key']} options={{ enabled: true }} />);

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });
    });
  });

  describe('Options Integration', () => {
    test('should respect enabled option', () => {
registerFetcher(['enabled-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['enabled-key']} options={{ enabled: false }} />);

      expect(screen.getByTestId('is-undefined')).toHaveTextContent('true');
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    test('should handle staleTime option', async () => {
registerFetcher(['stale-key'], {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 200
      });

      const { unmount } = render(
        <TestComponent queryKey={['stale-key']} options={{ enabled: true, staleTime: 200 }} />
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Unmount and wait for data to become stale
      unmount();
      await new Promise(resolve => setTimeout(resolve, 250));

      // Re-render - should still return cached data
      render(
        <TestComponent queryKey={['stale-key']} options={{ enabled: true, staleTime: 200 }} />
      );

      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
    });
  });

  describe('TypeScript Integration', () => {
    test('should handle typed data correctly', async () => {
      const userFetcher = jest.fn().mockImplementation(async () => ({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }));

registerFetcher(['user-key'], {
        fetcher: userFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['user-key']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"name":"John Doe","email":"john@example.com"}');
      });

      expect(screen.getByTestId('data-type')).toHaveTextContent('object');
    });
  });
});
