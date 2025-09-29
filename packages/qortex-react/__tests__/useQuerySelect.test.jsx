import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useQuerySelect } from '../src/useQuerySelect';
import { registerFetcher, setQueryData, dangerClearCache, invalidateQuery } from 'qortex-core';

// Mock console.log to track render calls
const originalConsoleLog = console.log;
let renderLogs = [];

beforeEach(() => {
  renderLogs = [];
  console.log = (...args) => {
    if (args[0] && args[0].includes('render')) {
      renderLogs.push(args[0]);
    }
    originalConsoleLog(...args);
  };
  dangerClearCache();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

// Mock fetcher
const mockFetcher = jest.fn().mockResolvedValue({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  status: 'active'
});

// Component that only uses data property
function DataOnlyComponent() {
  console.log('DataOnlyComponent render');
  const query = useQuerySelect('test-key', { fetcher: mockFetcher });
  
  return (
    <div data-testid="data-only">
      <span data-testid="name">{query.data?.name}</span>
      <span data-testid="email">{query.data?.email}</span>
    </div>
  );
}

// Component that only uses status properties
function StatusOnlyComponent() {
  console.log('StatusOnlyComponent render');
  const query = useQuerySelect('test-key', { fetcher: mockFetcher });
  
  return (
    <div data-testid="status-only">
      <span data-testid="is-loading">{query.isLoading ? 'Loading' : 'Not Loading'}</span>
      <span data-testid="is-success">{query.isSuccess ? 'Success' : 'Not Success'}</span>
      <span data-testid="is-error">{query.isError ? 'Error' : 'No Error'}</span>
    </div>
  );
}

describe('useQuerySelect Smart Subscription Verification', () => {
  beforeEach(() => {
    mockFetcher.mockClear();
    renderLogs = [];
  });

  test('DataOnlyComponent should NOT re-render when only status changes', async () => {
    registerFetcher('test-key', { fetcher: mockFetcher });
    
    render(<DataOnlyComponent />);
    
    // Wait for initial render and fetch
    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('John Doe');
    });
    
    // Clear render logs after initial render
    renderLogs = [];
    
    // Simulate a status change by triggering a new fetch with same data
    // This should change status properties but not data
    act(() => {
      mockFetcher.mockResolvedValueOnce({
        id: 1,
        name: 'John Doe', // Same data
        email: 'john@example.com', // Same data
        status: 'active' // Same data
      });
      registerFetcher('test-key', { fetcher: mockFetcher });
    });
    
    // Wait a bit to see if component re-renders
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // DataOnlyComponent should NOT have re-rendered because data didn't change
    // This is the key test for smart subscription
    expect(renderLogs.filter(log => log.includes('DataOnlyComponent render'))).toHaveLength(0);
  });

  test('DataOnlyComponent SHOULD re-render when data changes', async () => {
    registerFetcher('test-key', { fetcher: mockFetcher });
    
    render(<DataOnlyComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('John Doe');
    });
    
    renderLogs = [];
    
    // Update data with different values
    act(() => {
      setQueryData('test-key', {
        id: 1,
        name: 'Jane Smith', // Different data
        email: 'jane@example.com', // Different data
        status: 'active'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('Jane Smith');
    });
    
    // DataOnlyComponent should have re-rendered because data changed
    expect(renderLogs.filter(log => log.includes('DataOnlyComponent render')).length).toBeGreaterThan(0);
  });

  test('StatusOnlyComponent should NOT re-render when only data changes', async () => {
    registerFetcher('test-key', { fetcher: mockFetcher });
    
    render(<StatusOnlyComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('is-success')).toHaveTextContent('Success');
    });
    
    renderLogs = [];
    
    // Update only data (not status properties)
    act(() => {
      setQueryData('test-key', {
        id: 1,
        name: 'Different Name', // Different data
        email: 'different@example.com', // Different data
        status: 'active'
      });
    });
    
    // Wait a bit to see if component re-renders
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // StatusOnlyComponent should NOT have re-rendered because status didn't change
    // This is the key test for smart subscription
    expect(renderLogs.filter(log => log.includes('StatusOnlyComponent render'))).toHaveLength(0);
  });

  test('StatusOnlyComponent SHOULD re-render when status changes', async () => {
    // Create a slow fetcher to ensure we can catch the loading state
    const slowFetcher = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active'
      }), 100))
    );
    
    registerFetcher('test-key', { fetcher: slowFetcher });
    
    render(<StatusOnlyComponent />);
    
    // Wait for initial success state
    await waitFor(() => {
      expect(screen.getByTestId('is-success')).toHaveTextContent('Success');
    });
    
    renderLogs = [];
    
    // Invalidate to trigger a refetch
    act(() => {
      invalidateQuery('test-key');
    });
    
    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('Loading');
    });
    
    // The component should have re-rendered due to status change (success -> loading)
    expect(renderLogs.filter(log => log.includes('StatusOnlyComponent render')).length).toBeGreaterThan(0);
  });
});
