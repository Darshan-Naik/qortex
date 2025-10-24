import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { dangerClearCache, registerFetcher } from 'qortex-core';
import { useQuerySelect } from '../src/useQuerySelect';

// Test component that uses useQuerySelect
function TestComponent({ queryKey, options = {} }) {
  const query = useQuerySelect(queryKey, options);
  
  return (
    <div>
      <div data-testid="status">{query.status}</div>
      <div data-testid="isLoading">{query.isLoading.toString()}</div>
      <div data-testid="isSuccess">{query.isSuccess.toString()}</div>
      <div data-testid="data">{JSON.stringify(query.data)}</div>
    </div>
  );
}

describe('useQuerySelect Legacy React Integration Tests', () => {
  let mockFetcher;

  beforeEach(() => {
    // Clear queryManager state for each test
    dangerClearCache();
    
    // Default mock fetcher - must be async
    mockFetcher = jest.fn().mockImplementation(async () => ({ id: 1, data: 'test-data' }));
  });

  describe('Smart Subscription', () => {
    test('should work with Proxy-based smart subscription', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      expect(screen.getByTestId('isSuccess')).toHaveTextContent('true');
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test('should track accessed properties with Proxy', async () => {
      // Register fetcher
      registerFetcher(['test-key'], {
        fetcher: mockFetcher,
        enabled: false
      });

      render(<TestComponent queryKey={['test-key']} options={{ enabled: true }} />);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('success');
      });

      // The Proxy should have tracked the accessed properties (status, isLoading, isSuccess, data)
      // and the component should have rendered correctly
      expect(screen.getByTestId('status')).toHaveTextContent('success');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('isSuccess')).toHaveTextContent('true');
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"data":"test-data"}');
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
  });
});
