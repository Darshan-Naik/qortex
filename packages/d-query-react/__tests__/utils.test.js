import { snapshotEqual, computeStatusFlags, serializeKey } from '../src/utils';

describe('snapshotEqual', () => {
  describe('UseQueryResult Equality', () => {
    test('should return true for identical UseQueryResult objects', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(true);
    });

    test('should return true for same reference', () => {
      const result = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result, result)).toBe(true);
    });

    test('should return false for different status', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'error',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should return false for different isStale values', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: true,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should return false for different updatedAt values', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567891,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should return false for different isPlaceholderData values', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: true
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should return false for different error values', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: new Error('test error'),
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });
  });

  describe('Data Comparison', () => {
    test('should return true for same data reference', () => {
      const data = { id: 1, name: 'test' };
      const result1 = {
        status: 'success',
        data,
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data,
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(true);
    });

    test('should return true for identical object data', () => {
      const data = { id: 1, name: 'test', nested: { value: 42 } };
      const result1 = {
        status: 'success',
        data,
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data,
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(true);
    });

    test('should return false for different object data', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 2, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should return false for different object structure', () => {
      const result1 = {
        status: 'success',
        data: { id: 1, name: 'test' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1, name: 'test', extra: 'field' },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });

    test('should handle primitive data types', () => {
      const result1 = {
        status: 'success',
        data: 'test string',
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: 'test string',
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(true);
    });

    test('should return false for different primitive data', () => {
      const result1 = {
        status: 'success',
        data: 'test string',
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: 'different string',
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });
  });

  describe('Null and Undefined Handling', () => {
    test('should return true for both null', () => {
      expect(snapshotEqual(null, null)).toBe(true);
    });

    test('should return true for both undefined', () => {
      expect(snapshotEqual(undefined, undefined)).toBe(true);
    });

    test('should return false for null and undefined', () => {
      expect(snapshotEqual(null, undefined)).toBe(false);
    });

    test('should return false for null and object', () => {
      const result = {
        status: 'success',
        data: { id: 1 },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      expect(snapshotEqual(null, result)).toBe(false);
    });

    test('should return false for undefined and object', () => {
      const result = {
        status: 'success',
        data: { id: 1 },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      expect(snapshotEqual(undefined, result)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle data comparison errors gracefully', () => {
      const result1 = {
        status: 'success',
        data: { get value() { throw new Error('getter error'); } },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      const result2 = {
        status: 'success',
        data: { id: 1 },
        error: null,
        isStale: false,
        updatedAt: 1234567890,
        isPlaceholderData: false
      };
      
      expect(snapshotEqual(result1, result2)).toBe(false);
    });
  });
});

describe('computeStatusFlags', () => {
  test('should compute correct flags for idle state with no data', () => {
    const state = { status: 'idle' };
    const flags = computeStatusFlags(state, true);
    
    expect(flags.isLoading).toBe(true);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(false);
  });

  test('should compute correct flags for idle state with data', () => {
    const state = { status: 'idle', data: { id: 1 } };
    const flags = computeStatusFlags(state, true);
    
    expect(flags.isLoading).toBe(false);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(false);
  });

  test('should compute correct flags for fetching state', () => {
    const state = { status: 'fetching', data: { id: 1 } };
    const flags = computeStatusFlags(state, true);
    
    expect(flags.isLoading).toBe(false);
    expect(flags.isFetching).toBe(true);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(false);
  });

  test('should compute correct flags for success state', () => {
    const state = { status: 'success', data: { id: 1 } };
    const flags = computeStatusFlags(state, true);
    
    expect(flags.isLoading).toBe(false);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(true);
  });

  test('should compute correct flags for error state', () => {
    const state = { status: 'error', data: { id: 1 } };
    const flags = computeStatusFlags(state, true);
    
    expect(flags.isLoading).toBe(false);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(true);
    expect(flags.isSuccess).toBe(false);
  });

  test('should handle disabled queries', () => {
    const state = { status: 'idle' };
    const flags = computeStatusFlags(state, false);
    
    expect(flags.isLoading).toBe(false);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(false);
  });

  test('should handle undefined enabled flag', () => {
    const state = { status: 'idle' };
    const flags = computeStatusFlags(state, undefined);
    
    expect(flags.isLoading).toBe(true);
    expect(flags.isFetching).toBe(false);
    expect(flags.isError).toBe(false);
    expect(flags.isSuccess).toBe(false);
  });
});

describe('serializeKey', () => {
  test('should serialize string keys', () => {
    expect(serializeKey('test-key')).toBe('test-key');
  });

  test('should serialize array keys', () => {
    expect(serializeKey(['users', 123, 'profile'])).toBe('users,123,profile');
  });

  test('should serialize empty array', () => {
    expect(serializeKey([])).toBe('');
  });

  test('should serialize array with mixed types', () => {
    expect(serializeKey(['users', 123, true, null, undefined])).toBe('users,123,true,,');
  });

  test('should serialize single element array', () => {
    expect(serializeKey(['single'])).toBe('single');
  });
});