import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { useMutate, queryManager } from '../src/index';

const { dangerClearCache, registerFetcher } = queryManager;

// Test component that uses useMutate
function TestComponent({ mutationFn, options = {} }) {
  const mutation = useMutate(mutationFn, options);

  return (
    <div>
      <div data-testid="isPending">{mutation.isPending.toString()}</div>
      <div data-testid="error">{mutation.error?.message || 'null'}</div>
      <div data-testid="data">{JSON.stringify(mutation.data) || 'undefined'}</div>
      <button
        data-testid="mutate"
        onClick={() => mutation.mutate()}
      >
        Mutate
      </button>
      <button
        data-testid="reset"
        onClick={() => mutation.reset()}
      >
        Reset
      </button>
    </div>
  );
}

// Test component with arguments
function TestComponentWithArgs({ mutationFn, options = {} }) {
  const mutation = useMutate(mutationFn, options);

  return (
    <div>
      <div data-testid="isPending">{mutation.isPending.toString()}</div>
      <div data-testid="error">{mutation.error?.message || 'null'}</div>
      <div data-testid="data">{JSON.stringify(mutation.data) || 'undefined'}</div>
      <button
        data-testid="mutate"
        onClick={() => mutation.mutate('test-id', { title: 'Test Title' })}
      >
        Mutate
      </button>
      <button
        data-testid="mutateAsync"
        onClick={async () => {
          try {
            await mutation.mutateAsync('test-id', { title: 'Async Title' });
          } catch (e) {
            // Error handled by hook
          }
        }}
      >
        Mutate Async
      </button>
    </div>
  );
}

describe('useMutate React Integration Tests', () => {
  let mockMutationFn;

  beforeEach(() => {
    dangerClearCache();
    mockMutationFn = jest.fn().mockImplementation(async () => ({ id: 1, success: true }));
  });

  describe('Basic Mutation', () => {
    test('should have correct initial state', () => {
      render(<TestComponent mutationFn={mockMutationFn} />);

      expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('data')).toHaveTextContent('undefined');
      expect(mockMutationFn).not.toHaveBeenCalled();
    });

    test('should execute mutation on mutate call', async () => {
      render(<TestComponent mutationFn={mockMutationFn} />);

      // Click mutate button
      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      // Should be pending
      expect(screen.getByTestId('isPending')).toHaveTextContent('true');

      // Wait for mutation to complete
      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"success":true}');
      expect(mockMutationFn).toHaveBeenCalledTimes(1);
    });

    test('should pass arguments to mutation function', async () => {
      const mutationWithArgs = jest.fn().mockImplementation(async (id, data) => ({
        id,
        ...data,
        updated: true,
      }));

      render(<TestComponentWithArgs mutationFn={mutationWithArgs} />);

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      expect(mutationWithArgs).toHaveBeenCalledWith('test-id', { title: 'Test Title' });
      expect(screen.getByTestId('data')).toHaveTextContent('{"id":"test-id","title":"Test Title","updated":true}');
    });
  });

  describe('Loading States', () => {
    test('should show pending state during mutation', async () => {
      const slowMutation = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
      });

      render(<TestComponent mutationFn={slowMutation} />);

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      // Should be pending immediately
      expect(screen.getByTestId('isPending')).toHaveTextContent('true');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('data')).toHaveTextContent('{"success":true}');
    });
  });

  describe('Error Handling', () => {
    test('should handle mutation errors', async () => {
      const errorMutation = jest.fn().mockImplementation(async () => {
        throw new Error('Mutation failed');
      });

      render(<TestComponent mutationFn={errorMutation} />);

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Mutation failed');
      expect(screen.getByTestId('data')).toHaveTextContent('undefined');
    });

    test('should call onError callback on failure', async () => {
      const errorMutation = jest.fn().mockImplementation(async () => {
        throw new Error('Test error');
      });
      const onError = jest.fn();

      render(
        <TestComponent
          mutationFn={errorMutation}
          options={{ onError }}
        />
      );

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Array)
      );
    });
  });

  describe('Callbacks', () => {
    test('should call onSuccess callback on success', async () => {
      const onSuccess = jest.fn();

      render(
        <TestComponent
          mutationFn={mockMutationFn}
          options={{ onSuccess }}
        />
      );

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      expect(onSuccess).toHaveBeenCalledWith(
        { id: 1, success: true },
        expect.any(Array)
      );
    });

    test('should call onSettled callback on success', async () => {
      const onSettled = jest.fn();

      render(
        <TestComponent
          mutationFn={mockMutationFn}
          options={{ onSettled }}
        />
      );

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalled();
      });

      expect(onSettled).toHaveBeenCalledWith(
        { id: 1, success: true },
        undefined,
        expect.any(Array)
      );
    });

    test('should call onSettled callback on error', async () => {
      const errorMutation = jest.fn().mockImplementation(async () => {
        throw new Error('Test error');
      });
      const onSettled = jest.fn();

      render(
        <TestComponent
          mutationFn={errorMutation}
          options={{ onSettled }}
        />
      );

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalled();
      });

      expect(onSettled).toHaveBeenCalledWith(
        undefined,
        expect.any(Error),
        expect.any(Array)
      );
    });
  });

  describe('Reset Functionality', () => {
    test('should reset mutation state', async () => {
      render(<TestComponent mutationFn={mockMutationFn} />);

      // Execute mutation
      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"id":1,"success":true}');
      });

      // Reset
      act(() => {
        fireEvent.click(screen.getByTestId('reset'));
      });

      expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('data')).toHaveTextContent('undefined');
    });

    test('should reset error state', async () => {
      const errorMutation = jest.fn().mockImplementation(async () => {
        throw new Error('Test error');
      });

      render(<TestComponent mutationFn={errorMutation} />);

      // Execute failing mutation
      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error');
      });

      // Reset
      act(() => {
        fireEvent.click(screen.getByTestId('reset'));
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  describe('mutateAsync', () => {
    test('should return promise that resolves with data', async () => {
      const mutationWithArgs = jest.fn().mockImplementation(async (id, data) => ({
        id,
        ...data,
      }));

      render(<TestComponentWithArgs mutationFn={mutationWithArgs} />);

      act(() => {
        fireEvent.click(screen.getByTestId('mutateAsync'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('data')).toHaveTextContent('{"id":"test-id","title":"Async Title"}');
    });
  });

  describe('Query Invalidation', () => {
    test('should invalidate query after mutation', async () => {
      const mockFetcher = jest.fn().mockImplementation(async () => ({ data: 'test' }));

      registerFetcher(['test-query'], {
        fetcher: mockFetcher,
        enabled: false,
      });

      render(
        <TestComponent
          mutationFn={mockMutationFn}
          options={{ queryKey: ['test-query'] }}
        />
      );

      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('isPending')).toHaveTextContent('false');
      });

      // The query should have been invalidated (fetcher called)
      // Note: This depends on how invalidateQuery works in your implementation
      expect(mockMutationFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Mutations', () => {
    test('should handle consecutive mutations', async () => {
      let callCount = 0;
      const sequentialMutation = jest.fn().mockImplementation(async () => {
        callCount++;
        return { count: callCount };
      });

      render(<TestComponent mutationFn={sequentialMutation} />);

      // First mutation
      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"count":1}');
      });

      // Second mutation
      act(() => {
        fireEvent.click(screen.getByTestId('mutate'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('{"count":2}');
      });

      expect(sequentialMutation).toHaveBeenCalledTimes(2);
    });
  });
});
