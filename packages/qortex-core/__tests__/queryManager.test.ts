// Named imports work directly - no destructuring needed!
import {
  registerFetcher,
  fetchQuery,
  setQueryData,
  getQueryData,
  getQueryState,
  invalidateQuery,
  subscribeQuery,
  setDefaultConfig,
  dangerClearCache,
} from "../src/queryManager";

describe("QueryManager Core Tests", () => {
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    // Clear all state before each test
    // ⚠️ Using dangerClearCache() is safe here in test environment only
    dangerClearCache();

    // Default mock fetcher - must be async
    mockFetcher = jest
      .fn()
      .mockImplementation(async () => ({ id: 1, data: "test-data" }));
  });

  describe("Basic Functionality", () => {
    test("should register fetcher and fetch data", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true,
      });

      // Should fetch immediately when enabled
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get query data (without triggering another fetch)
      const data = getQueryData(key, { enabled: false });
      expect(data).toEqual({ id: 1, data: "test-data" });
    });

    test("should not fetch when enabled is false", () => {
      const key = ["test-key"];

      // Register fetcher with enabled: false
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Should not fetch
      expect(mockFetcher).not.toHaveBeenCalled();

      // Get query data should be undefined
      const data = getQueryData(key);
      expect(data).toBeUndefined();
    });

    test("should handle getQueryState", () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Get initial state (without triggering fetch)
      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("idle");
      expect(state.data).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.isStale).toBe(false); // Never fetched queries are not stale
    });

    test("should handle setQueryData", () => {
      const key = ["test-key"];
      const testData = { id: 1, name: "test" };

      // Set query data
      setQueryData(key, testData);

      // Get query data (without triggering fetch)
      const data = getQueryData(key, { enabled: false });
      expect(data).toEqual(testData);

      // Get query state (without triggering fetch)
      const state = getQueryState(key, { enabled: false });
      expect(state.data).toEqual(testData);
      expect(state.status).toBe("success");
    });

    test("should handle refetch function", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true,
      });

      // Wait for initial fetch
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get query state and verify initial fetch
      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Call refetch
      state.refetch();

      // Should trigger another fetch
      expect(mockFetcher).toHaveBeenCalledTimes(2);

      // Wait for refetch to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // State should still be success
      const newState = getQueryState(key, { enabled: false });
      expect(newState.status).toBe("success");
    });

    test("should handle subscription callbacks with refetch", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true,
      });

      // Wait for initial fetch
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Subscribe using subscribeQuery (like React does)
      const unsubscribe = subscribeQuery(key, callback, { enabled: false });

      // Get initial state
      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Call refetch
      state.refetch();

      // Should trigger another fetch
      expect(mockFetcher).toHaveBeenCalledTimes(2);

      // Wait for refetch to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Callback should have been called when state changed
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe("Fetching Logic", () => {
    test("should handle successful fetch", async () => {
      const key = ["test-key"];
      const testData = { id: 1, name: "success" };
      mockFetcher.mockImplementation(async () => testData);

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true,
      });

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      const data = getQueryData(key);
      expect(data).toEqual(testData);

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.error).toBeUndefined();
    });

    test("should handle fetch error", async () => {
      const key = ["test-key"];
      const testError = new Error("Fetch failed");
      mockFetcher.mockImplementation(async () => {
        throw testError;
      });

      // Register fetcher with disabled to avoid immediate fetch
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Start a fetch manually and wait for it to fail
      try {
        await fetchQuery(key);
      } catch (err) {
        // Expected to throw
      }

      // Wait a bit for error state to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("error");
      expect(state.error).toBe(testError);
      expect(state.data).toBeUndefined();
    });

    test("should handle fetch completion", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Set some initial data first
      setQueryData(key, { id: 1, name: "initial" });

      // Start a fetch manually
      const fetchPromise = fetchQuery(key);

      // Wait for fetch to complete
      await fetchPromise;

      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.data).toEqual({ id: 1, data: "test-data" }); // Should have new data from fetch
    });
  });

  describe("Throttling and Inflight Checks", () => {
    test("should throttle rapid fetch calls", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Make multiple rapid calls
      getQueryData(key, { enabled: true });
      getQueryData(key, { enabled: true });
      getQueryData(key, { enabled: true });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only fetch once due to throttling
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test("should respect inflight requests", async () => {
      const key = ["test-key"];
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetcher.mockReturnValue(slowPromise);

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: true,
      });

      // Make another call while first is inflight
      getQueryData(key, { enabled: true });

      // Resolve the first promise
      resolvePromise!({ id: 1, data: "slow" });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only fetch once due to inflight check
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe("Subscription Management", () => {
    test("should handle subscribeQuery", () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe
      const unsubscribe = subscribeQuery(key, callback, { enabled: true });

      expect(typeof unsubscribe).toBe("function");

      // Unsubscribe
      unsubscribe();

      // Should not throw
      expect(() => unsubscribe()).not.toThrow();
    });

    test("should handle callback without state parameter", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe with callback that doesn't use state parameter
      const unsubscribe = subscribeQuery(
        key,
        () => {
          callback();
        },
        { enabled: true }
      );

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should have been called
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });

    test("should handle callback with state parameter", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe with callback that uses state parameter
      const unsubscribe = subscribeQuery(
        key,
        (state) => {
          callback(state);
        },
        { enabled: true }
      );

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should have been called with state
      expect(callback).toHaveBeenCalled();
      const stateArg = callback.mock.calls[0][0];
      expect(stateArg).toHaveProperty("status");
      expect(stateArg).toHaveProperty("data");
      expect(stateArg).toHaveProperty("isLoading");
      expect(stateArg).toHaveProperty("isFetching");
      expect(stateArg).toHaveProperty("isSuccess");
      expect(stateArg).toHaveProperty("refetch");

      // Cleanup
      unsubscribe();
    });

    test("should handle callback with optional state parameter (ignoring state)", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe with callback that has state parameter but doesn't use it
      const unsubscribe = subscribeQuery(
        key,
        (state) => {
          // User chooses not to use the state parameter
          callback("callback-called");
        },
        { enabled: true }
      );

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should have been called
      expect(callback).toHaveBeenCalledWith("callback-called");

      // Cleanup
      unsubscribe();
    });

    test("should handle callback with optional state parameter (using state)", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe with callback that conditionally uses state parameter
      const unsubscribe = subscribeQuery(
        key,
        (state) => {
          if (state && state.status === "success") {
            callback("success-state", state.data);
          } else {
            callback("other-state");
          }
        },
        { enabled: true }
      );

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should have been called with success state
      expect(callback).toHaveBeenCalled();
      const calls = callback.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe("success-state");
      expect(lastCall[1]).toEqual({ id: 1, data: "test-data" });

      // Cleanup
      unsubscribe();
    });

    test("should handle multiple callbacks with different state usage patterns", async () => {
      const key = ["test-key"];
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe with different callback patterns
      const unsubscribe1 = subscribeQuery(
        key,
        () => {
          callback1("no-state");
        },
        { enabled: true }
      );

      const unsubscribe2 = subscribeQuery(
        key,
        (state) => {
          callback2("with-state", state?.status);
        },
        { enabled: true }
      );

      const unsubscribe3 = subscribeQuery(
        key,
        (state) => {
          // Conditional usage
          if (state) {
            callback3("conditional", state.data);
          }
        },
        { enabled: true }
      );

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // All callbacks should have been called
      expect(callback1).toHaveBeenCalledWith("no-state");
      expect(callback2).toHaveBeenCalledWith("with-state", "success");
      expect(callback3).toHaveBeenCalledWith("conditional", {
        id: 1,
        data: "test-data",
      });

      // Cleanup
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    test("should notify subscribers on state changes", async () => {
      const key = ["test-key"];
      const callback = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe
      subscribeQuery(key, callback, { enabled: true });

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should have been called due to state changes
      expect(callback).toHaveBeenCalled();
    });

    test("should handle multiple subscribers", async () => {
      const key = ["test-key"];
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe both
      subscribeQuery(key, callback1, { enabled: true });
      subscribeQuery(key, callback2, { enabled: true });

      // Wait for fetch to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Both should have been called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("Options Integration", () => {
    test("should handle refetchOnSubscribe: always", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // First subscription - should fetch once
      subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Wait for throttle to expire (default is 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Second subscription with refetchOnSubscribe: always - should fetch again
      subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: "always",
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should fetch twice
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test("should handle refetchOnSubscribe: stale", async () => {
      const key = ["test-key"];

      // Register fetcher with short staleTime
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 50,
      });

      // First subscription
      subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Wait for data to become stale AND throttle to expire (500ms default)
      await new Promise((resolve) => setTimeout(resolve, 550));

      // Second subscription with refetchOnSubscribe: stale
      subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: "stale",
      });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should fetch twice (first + refetch when stale)
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    test("should handle refetchOnSubscribe: false", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // First subscription
      subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Second subscription with refetchOnSubscribe: false
      subscribeQuery(key, jest.fn(), {
        enabled: true,
        refetchOnSubscribe: false,
      });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only fetch once
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    test("should handle staleTime option", async () => {
      const key = ["test-key"];

      // Register fetcher with staleTime
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        staleTime: 100,
      });

      // Subscribe and fetch
      subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Initially should not be stale
      let state = getQueryState(key, { staleTime: 100 });
      expect(state.isStale).toBe(false);

      // Wait for data to become stale
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Should be stale now
      state = getQueryState(key, { staleTime: 100 });
      expect(state.isStale).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle undefined query key", () => {
      expect(() => {
        getQueryData(undefined as any);
      }).not.toThrow();

      expect(() => {
        getQueryState(undefined as any);
      }).not.toThrow();
    });

    test("should handle empty query key", () => {
      expect(() => {
        getQueryData([]);
      }).not.toThrow();

      expect(() => {
        getQueryState([]);
      }).not.toThrow();
    });

    test("should handle non-existent query", () => {
      const data = getQueryData(["non-existent"], { enabled: false });
      expect(data).toBeUndefined();

      const state = getQueryState(["non-existent"], { enabled: false });
      expect(state.status).toBe("idle");
      expect(state.data).toBeUndefined();
    });

    test("should handle multiple fetchers for same key", () => {
      const key = ["test-key"];
      const fetcher1 = jest.fn().mockImplementation(async () => ({ id: 1 }));
      const fetcher2 = jest.fn().mockImplementation(async () => ({ id: 2 }));

      // Register first fetcher
      registerFetcher(key, {
        fetcher: fetcher1,
        enabled: false,
      });

      // Register second fetcher (should override first)
      registerFetcher(key, {
        fetcher: fetcher2,
        enabled: true,
      });

      // Should use second fetcher
      expect(fetcher2).toHaveBeenCalledTimes(1);
      expect(fetcher1).not.toHaveBeenCalled();
    });
  });

  describe("isSuccess and isError Behavior", () => {
    test("should maintain isSuccess=true during refetch and only set false on error", async () => {
      const key = ["test-key"];
      const successData = { id: 1, data: "success" };
      const refetchData = { id: 2, data: "refetch-success" };

      // Start with successful fetcher
      mockFetcher.mockImplementation(async () => successData);

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
        usePreviousDataOnError: true,
      });

      // Initial fetch
      await fetchQuery(key);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check initial state - should be success
      let state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.isSuccess).toBe(true);
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(successData);

      // Update fetcher to return different data for refetch
      mockFetcher.mockImplementation(async () => refetchData);

      // Refetch - isSuccess should remain true during refetch
      const refetchPromise = state.refetch();

      // Check state during refetch
      state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("fetching");
      expect(state.isFetching).toBe(true);
      expect(state.isSuccess).toBe(true); // Should remain true during refetch
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(successData); // Should still have previous data

      // Wait for refetch to complete
      await refetchPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check state after successful refetch
      state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.isSuccess).toBe(true); // Should still be true after successful refetch
      expect(state.isError).toBe(false);
      expect(state.data).toEqual(refetchData); // Should have new data

      // Now test error scenario - update fetcher to fail
      const errorData = new Error("Fetch failed");
      mockFetcher.mockImplementation(async () => {
        throw errorData;
      });

      // Refetch that will fail - isSuccess should become false
      const errorRefetchPromise = state.refetch();

      // Check state during error fetch
      state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("fetching");
      expect(state.isFetching).toBe(true);
      expect(state.isSuccess).toBe(true); // Should still be true during fetch
      expect(state.isError).toBe(false);

      // Wait for error to occur
      try {
        await errorRefetchPromise;
      } catch (err) {
        // Expected to throw
      }
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check state after error
      state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("error");
      expect(state.isSuccess).toBe(false); // Should be false after error
      expect(state.isError).toBe(true); // Should be true after error
      expect(state.error).toBe(errorData);
      expect(state.data).toEqual(refetchData); // Should still have previous data

      // Test recovery - successful fetch after error
      const recoveryData = { id: 3, data: "recovery-success" };
      mockFetcher.mockImplementation(async () => recoveryData);

      // Refetch that will succeed - isSuccess should become true again
      const recoveryPromise = state.refetch();

      // Wait for recovery to complete
      await recoveryPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check state after recovery
      state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.isSuccess).toBe(true); // Should be true again after successful recovery
      expect(state.isError).toBe(false); // Should be false after successful recovery
      expect(state.data).toEqual(recoveryData); // Should have new data
    });

    test("should handle isSuccess=false on first fetch with no data", async () => {
      const key = ["test-key"];
      const errorData = new Error("First fetch failed");

      // Start with failing fetcher
      mockFetcher.mockImplementation(async () => {
        throw errorData;
      });

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // First fetch that will fail
      try {
        await fetchQuery(key);
      } catch (err) {
        // Expected to throw
      }
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check state after first fetch error
      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("error");
      expect(state.isSuccess).toBe(false); // Should be false on first fetch error
      expect(state.isError).toBe(true); // Should be true on first fetch error
      expect(state.data).toBeUndefined(); // Should have no data
      expect(state.error).toBe(errorData);
    });

    test("should handle isSuccess=true when data is set manually", () => {
      const key = ["test-key"];
      const testData = { id: 1, data: "manual-data" };

      // Set data manually
      setQueryData(key, testData);

      // Check state after manual data set
      const state = getQueryState(key, { enabled: false });
      expect(state.status).toBe("success");
      expect(state.isSuccess).toBe(true); // Should be true when data is set manually
      expect(state.isError).toBe(false); // Should be false when data is set manually
      expect(state.data).toEqual(testData);
    });
  });

  describe("Cache Management", () => {
    test("should handle cache persistence", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe and fetch
      const unsubscribe = subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Unsubscribe
      unsubscribe();

      // Data should still be available (no automatic eviction in current implementation)
      const data = getQueryData(key, { enabled: false });
      expect(data).toEqual({ id: 1, data: "test-data" });
    });

    test("should handle cache persistence with active subscribers", async () => {
      const key = ["test-key"];

      // Register fetcher
      registerFetcher(key, {
        fetcher: mockFetcher,
        enabled: false,
      });

      // Subscribe and fetch
      const unsubscribe = subscribeQuery(key, jest.fn(), { enabled: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Data should be available
      const data = getQueryData(key, { enabled: false });
      expect(data).toEqual({ id: 1, data: "test-data" });

      // Unsubscribe
      unsubscribe();

      // Data should still be available (no automatic eviction in current implementation)
      const evictedData = getQueryData(key, { enabled: false });
      expect(evictedData).toEqual({ id: 1, data: "test-data" });
    });
  });

  describe("Developer Experience", () => {
    test("should warn when fetchQuery is called without fetcher and no data", async () => {
      const key = ["no-fetcher-key"];
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Try to fetch without registering a fetcher and without setting data
      const result = await fetchQuery(key);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[qortex] No fetcher or data for key "no-fetcher-key"'
        )
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Register a fetcher or set initial data")
      );
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    test("should not warn when fetchQuery is called without fetcher but updatedAt exists", async () => {
      const key = ["no-fetcher-with-updatedAt"];
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const testData = { id: 1, name: "test" };

      // Set data first (this sets updatedAt)
      setQueryData(key, testData);

      // Try to fetch without registering a fetcher but with existing updatedAt
      const result = await fetchQuery(key);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toEqual(testData);

      consoleSpy.mockRestore();
    });
  });
});
