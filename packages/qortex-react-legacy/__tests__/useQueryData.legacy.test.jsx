import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { dangerClearCache, registerFetcher } from 'qortex-core';
import { useQueryData } from '../src/useQueryData';
import { useQuery } from '../src/useQuery';

// Test component that uses useQueryData
function TestComponent({ queryKey, options = {} }) {
  const data = useQueryData(queryKey, options);
  
  return (
    <div>
      <div data-testid="data">{JSON.stringify(data)}</div>
    </div>
  );
}

describe('useQueryData Legacy React Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state for each test
    dangerClearCache();
    
    // Default mock fetcher - must be async
    mockFetcher = jest.fn().mockImplementation(async () => ({ id: 1, data: 'test-data' }));
  });

  describe('Basic Data Subscription', () => {
    test('should return data when available', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Initially should be undefined
      expect(screen.getByTestId('data')).toHaveTextContent('');

      // Wait for data to be available
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should return undefined for disabled queries', () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: false }} />);

      // Should remain undefined
      expect(screen.getByTestId('data')).toHaveTextContent('');
      expect(mockFetcher).not.toHaveBeenCalled();
    });
  });

  describe('Data-Only Re-renders', () => {
    test('should only re-render when data changes', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for initial data
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Rerender with same props
      rerender(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Data should remain the same
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Types and Edge Cases', () => {
    test('should handle null data', async () => {
      const nullFetcher = jest.fn().mockResolvedValue(null);

      registerFetcher(['null-data'], {
        fetcher: nullFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['null-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('');
      });
    });

    test('should handle primitive data types', async () => {
      const stringFetcher = jest.fn().mockResolvedValue('hello world');
      const numberFetcher = jest.fn().mockResolvedValue(42);
      const booleanFetcher = jest.fn().mockResolvedValue(true);

      registerFetcher(['string-data'], {
        fetcher: stringFetcher,
        enabled: false
      });

      registerFetcher(['number-data'], {
        fetcher: numberFetcher,
        enabled: false
      });

      registerFetcher(['boolean-data'], {
        fetcher: booleanFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponent queryKey={['string-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('"hello world"');
      });

      rerender(<TestComponent queryKey={['number-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('42');
      });

      rerender(<TestComponent queryKey={['boolean-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('true');
      });
    });

    test('should handle complex nested objects', async () => {
      const complexData = {
        user: {
          id: 1,
          name: 'John Doe',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            coordinates: {
              lat: 40.7128,
              lng: -74.0060
            }
          },
          hobbies: ['reading', 'coding', 'gaming']
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00Z',
          tags: ['premium', 'verified']
        }
      };

      const complexFetcher = jest.fn().mockResolvedValue(complexData);

      registerFetcher(['complex-data'], {
        fetcher: complexFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['complex-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(complexData));
      });
    });
  });

  describe('Comparison with useQuery', () => {
    test('should return same data as useQuery.data', async () => {
      registerFetcher(['comparison-test'], {
        fetcher: mockFetcher,
        enabled: false
      });

      function ComparisonComponent({ queryKey, options = {} }) {
        const query = useQuery(queryKey, options);
        const data = useQueryData(queryKey, options);
        
        return (
          <div>
            <div data-testid="query-data">{JSON.stringify(query.data)}</div>
            <div data-testid="hook-data">{JSON.stringify(data)}</div>
            <div data-testid="data-match">{(query.data === data).toString()}</div>
          </div>
        );
      }

      render(<ComparisonComponent queryKey={['comparison-test']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('query-data')).toHaveTextContent('{"id":1,"data":"test-data"}');
        expect(screen.getByTestId('hook-data')).toHaveTextContent('{"id":1,"data":"test-data"}');
        expect(screen.getByTestId('data-match')).toHaveTextContent('true');
      });
    });
  });

  describe('Error Scenarios', () => {
    test('should return undefined when query is in error state', async () => {
      const errorFetcher = jest.fn().mockRejectedValue(new Error('Test error'));

      registerFetcher(['error-data'], {
        fetcher: errorFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['error-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('');
      });
    });

    test('should return undefined for non-existent query keys', () => {
      render(<TestComponent queryKey={['non-existent']} options={{ enabled: true }} />);

      expect(screen.getByTestId('data')).toHaveTextContent('');
    });
  });

  describe('Performance and Memoization', () => {
    test('should not cause unnecessary re-renders', async () => {
      const renderCount = jest.fn();
      
      function TestComponentWithRenderCount({ queryKey, options = {} }) {
        renderCount();
        const data = useQueryData(queryKey, options);
        
        return (
          <div>
            <div data-testid="data">{JSON.stringify(data)}</div>
          </div>
        );
      }

      registerFetcher(['performance-test'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { rerender } = render(<TestComponentWithRenderCount queryKey={['performance-test']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      const initialRenderCount = renderCount.mock.calls.length;

      // Re-render with same props
      rerender(<TestComponentWithRenderCount queryKey={['performance-test']} options={{ enabled: true }} />);

      // Should not cause excessive re-renders
      expect(renderCount.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount);
      expect(renderCount.mock.calls.length).toBeLessThan(initialRenderCount + 5);
    });
  });

  describe('Multiple Components', () => {
    test('should handle multiple components with same query key', async () => {
      registerFetcher(['multi-data'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['multi-data']} options={{ enabled: true }} />
          <TestComponent queryKey={['multi-data']} options={{ enabled: true }} />
        </div>
      );

      const dataElements = screen.getAllByTestId('data');

      await waitFor(() => {
        dataElements.forEach(element => {
          expect(element).toHaveTextContent('{"id":1,"data":"test-data"}');
        });
      });
    });

    test('should handle multiple components with different query keys', async () => {
      registerFetcher(['multi-data-1'], {
        fetcher: jest.fn().mockResolvedValue({ id: 1, data: 'data-1' }),
        enabled: false
      });

      registerFetcher(['multi-data-2'], {
        fetcher: jest.fn().mockResolvedValue({ id: 2, data: 'data-2' }),
        enabled: false
      });

      render(
        <div>
          <TestComponent queryKey={['multi-data-1']} options={{ enabled: true }} />
          <TestComponent queryKey={['multi-data-2']} options={{ enabled: true }} />
        </div>
      );

      const dataElements = screen.getAllByTestId('data');

      await waitFor(() => {
        expect(dataElements[0]).toHaveTextContent('{"id":1,"data":"data-1"}');
        expect(dataElements[1]).toHaveTextContent('{"id":2,"data":"data-2"}');
      });
    });
  });

  describe('Subscription Management', () => {
    test('should clean up subscriptions on unmount', async () => {
      registerFetcher(['cleanup-test'], {
        fetcher: mockFetcher,
        enabled: false
      });

      const { unmount } = render(<TestComponent queryKey={['cleanup-test']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Options Integration', () => {
    test('should respect enabled option', () => {
      registerFetcher(['enabled-test'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['enabled-test']} options={{ enabled: false }} />);

      // Should remain undefined when disabled
      expect(screen.getByTestId('data')).toHaveTextContent('');
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    test('should handle staleTime option', async () => {
      const fetcherSpy = jest.fn().mockResolvedValue({ id: 1, data: 'test-data' });

      registerFetcher(['stale-time-data'], {
        fetcher: fetcherSpy,
        enabled: false,
        staleTime: 1000
      });

      const { unmount } = render(<TestComponent queryKey={['stale-time-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      expect(fetcherSpy).toHaveBeenCalledTimes(1);

      // Unmount and remount quickly
      unmount();
      render(<TestComponent queryKey={['stale-time-data']} options={{ enabled: true }} />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      });

      // Should not have been called again due to staleTime
      expect(fetcherSpy).toHaveBeenCalledTimes(1);
    });
  });
});
