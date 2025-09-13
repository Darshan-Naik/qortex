import { snapshotEqual } from '../src/utils';

describe('snapshotEqual', () => {
  describe('Basic Equality', () => {
    test('should return true for identical objects', () => {
      const obj1 = { data: 'test', status: 'success' };
      const obj2 = { data: 'test', status: 'success' };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should return true for same reference', () => {
      const obj = { data: 'test', status: 'success' };
      
      expect(snapshotEqual(obj, obj)).toBe(true);
    });

    test('should return false for different objects', () => {
      const obj1 = { data: 'test', status: 'success' };
      const obj2 = { data: 'different', status: 'success' };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });

    test('should return false for objects with different properties', () => {
      const obj1 = { data: 'test', status: 'success' };
      const obj2 = { data: 'test', status: 'error' };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
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
      const obj = { data: 'test' };
      expect(snapshotEqual(null, obj)).toBe(false);
    });

    test('should return false for undefined and object', () => {
      const obj = { data: 'test' };
      expect(snapshotEqual(undefined, obj)).toBe(false);
    });
  });

  describe('Primitive Values', () => {
    test('should return true for identical strings', () => {
      expect(snapshotEqual('test', 'test')).toBe(true);
    });

    test('should return false for different strings', () => {
      expect(snapshotEqual('test', 'different')).toBe(false);
    });

    test('should return true for identical numbers', () => {
      expect(snapshotEqual(42, 42)).toBe(true);
    });

    test('should return false for different numbers', () => {
      expect(snapshotEqual(42, 43)).toBe(false);
    });

    test('should return true for identical booleans', () => {
      expect(snapshotEqual(true, true)).toBe(true);
      expect(snapshotEqual(false, false)).toBe(true);
    });

    test('should return false for different booleans', () => {
      expect(snapshotEqual(true, false)).toBe(false);
    });
  });

  describe('Object Properties', () => {
    test('should handle objects with same properties in different order', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { c: 3, a: 1, b: 2 };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle objects with different number of properties', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2, c: 3 };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });

    test('should handle nested objects', () => {
      const obj1 = { 
        data: { id: 1, name: 'test' }, 
        status: 'success' 
      };
      const obj2 = { 
        data: { id: 1, name: 'test' }, 
        status: 'success' 
      };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle nested objects with different values', () => {
      const obj1 = { 
        data: { id: 1, name: 'test' }, 
        status: 'success' 
      };
      const obj2 = { 
        data: { id: 2, name: 'test' }, 
        status: 'success' 
      };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('Array Handling', () => {
    test('should handle arrays with same elements', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      
      expect(snapshotEqual(arr1, arr2)).toBe(true);
    });

    test('should handle arrays with different elements', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      
      expect(snapshotEqual(arr1, arr2)).toBe(false);
    });

    test('should handle arrays with different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      
      expect(snapshotEqual(arr1, arr2)).toBe(false);
    });

    test('should handle arrays with objects', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 1 }, { id: 2 }];
      
      expect(snapshotEqual(arr1, arr2)).toBe(true);
    });

    test('should handle arrays with different objects', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 1 }, { id: 3 }];
      
      expect(snapshotEqual(arr1, arr2)).toBe(false);
    });
  });

  describe('Function Properties', () => {
    test('should handle objects with function properties', () => {
      const fn1 = () => {};
      const fn2 = () => {};
      const obj1 = { data: 'test', fn: fn1 };
      const obj2 = { data: 'test', fn: fn1 };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle objects with different function properties', () => {
      const fn1 = () => {};
      const fn2 = () => {};
      const obj1 = { data: 'test', fn: fn1 };
      const obj2 = { data: 'test', fn: fn2 };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('Date Handling', () => {
    test('should handle Date objects', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      
      expect(snapshotEqual(date1, date2)).toBe(true);
    });

    test('should handle different Date objects', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');
      
      expect(snapshotEqual(date1, date2)).toBe(false);
    });

    test('should handle objects with Date properties', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const obj1 = { data: 'test', date: date1 };
      const obj2 = { data: 'test', date: date2 };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('Special Values', () => {
    test('should handle NaN values', () => {
      expect(snapshotEqual(NaN, NaN)).toBe(true);
    });

    test('should handle Infinity values', () => {
      expect(snapshotEqual(Infinity, Infinity)).toBe(true);
      expect(snapshotEqual(-Infinity, -Infinity)).toBe(true);
    });

    test('should handle different special values', () => {
      expect(snapshotEqual(NaN, Infinity)).toBe(false);
      expect(snapshotEqual(Infinity, -Infinity)).toBe(false);
    });
  });

  describe('Complex Objects', () => {
    test('should handle complex nested structures', () => {
      const obj1 = {
        data: {
          user: {
            id: 1,
            profile: {
              name: 'John',
              settings: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        },
        status: 'success',
        timestamp: new Date('2023-01-01')
      };
      
      const obj2 = {
        data: {
          user: {
            id: 1,
            profile: {
              name: 'John',
              settings: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        },
        status: 'success',
        timestamp: new Date('2023-01-01')
      };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle complex nested structures with differences', () => {
      const obj1 = {
        data: {
          user: {
            id: 1,
            profile: {
              name: 'John',
              settings: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        },
        status: 'success'
      };
      
      const obj2 = {
        data: {
          user: {
            id: 1,
            profile: {
              name: 'Jane',
              settings: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        },
        status: 'success'
      };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty objects', () => {
      expect(snapshotEqual({}, {})).toBe(true);
    });

    test('should handle empty arrays', () => {
      expect(snapshotEqual([], [])).toBe(true);
    });

    test('should handle objects with undefined properties', () => {
      const obj1 = { a: 1, b: undefined };
      const obj2 = { a: 1, b: undefined };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle objects with null properties', () => {
      const obj1 = { a: 1, b: null };
      const obj2 = { a: 1, b: null };
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle mixed null and undefined properties', () => {
      const obj1 = { a: 1, b: null };
      const obj2 = { a: 1, b: undefined };
      
      expect(snapshotEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large objects efficiently', () => {
      const createLargeObject = (size) => {
        const obj = {};
        for (let i = 0; i < size; i++) {
          obj[`key${i}`] = `value${i}`;
        }
        return obj;
      };
      
      const obj1 = createLargeObject(1000);
      const obj2 = createLargeObject(1000);
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });

    test('should handle deeply nested objects', () => {
      const createDeepObject = (depth) => {
        if (depth === 0) return { value: 'leaf' };
        return { nested: createDeepObject(depth - 1) };
      };
      
      const obj1 = createDeepObject(10);
      const obj2 = createDeepObject(10);
      
      expect(snapshotEqual(obj1, obj2)).toBe(true);
    });
  });
});
