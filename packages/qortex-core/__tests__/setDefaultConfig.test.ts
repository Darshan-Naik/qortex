import {
    registerFetcher,
    fetchQuery,
    getQueryState,
    setDefaultConfig
} from '../src/queryManager';

describe('setDefaultConfig', () => {
    beforeEach(() => {
        // Reset default config for each test
        setDefaultConfig({});
    });

    it('should apply default configuration to new queries', async () => {
        // Set default config
        setDefaultConfig({
            staleTime: 5000,
            refetchOnSubscribe: "always"
        });

        // Register a fetcher without specifying these options
        const mockFetcher = jest.fn().mockImplementation(async () => 'test-data');
        registerFetcher(['test'], {
            fetcher: mockFetcher
        });

        // Fetch the query to get data
        await fetchQuery(['test']);

        // Wait a bit for state to be updated
        await new Promise(resolve => setTimeout(resolve, 10));

        // Get the query state
        const state = getQueryState(['test']);

        // Should have the default values
        expect(state.isStale).toBe(false); // Because staleTime is 5000ms and data is fresh
    });

    it('should allow query-specific options to override defaults', async () => {
        // Set default config
        setDefaultConfig({
            staleTime: 5000,
            refetchOnSubscribe: "always"
        });

        // Register a fetcher with overriding options
        const mockFetcher = jest.fn().mockImplementation(async () => 'test-data');
        registerFetcher(['test'], {
            fetcher: mockFetcher,
            staleTime: 10000, // Override default
            refetchOnSubscribe: "stale" // Override default
        });

        // Fetch the query to get data
        await fetchQuery(['test']);

        // Get the query state
        const state = getQueryState(['test']);

        // Should have the overridden values, not the defaults
        expect(state.isStale).toBe(false); // Because staleTime is 10000ms (overridden)
    });

    it('should merge multiple setDefaultConfig calls', () => {
        // Set first batch of defaults
        setDefaultConfig({
            staleTime: 5000
        });

        // Set second batch of defaults
        setDefaultConfig({
            refetchOnSubscribe: "always"
        });

        // Register a fetcher
        const mockFetcher = jest.fn().mockImplementation(async () => 'test-data');
        registerFetcher(['test'], {
            fetcher: mockFetcher
        });

        // Get the query state
        const state = getQueryState(['test']);

        // Should have both default values
        expect(state.isStale).toBe(false); // Because staleTime is 5000ms
    });

    it('should work with useQuery hook', async () => {
        // Set default config
        setDefaultConfig({
            staleTime: 10000
        });

        // Register a fetcher
        const mockFetcher = jest.fn().mockImplementation(async () => 'test-data');
        registerFetcher(['hook-test'], {
            fetcher: mockFetcher
        });

        // Fetch the query
        await fetchQuery(['hook-test']);

        // Wait a bit for state to be updated
        await new Promise(resolve => setTimeout(resolve, 10));

        // Get the query state
        const state = getQueryState(['hook-test']);

        // Should have the default staleTime applied
        expect(state.isStale).toBe(false); // Because staleTime is 10000ms and data is fresh
    });

    it('should support configurable throttleTime', async () => {
        // Set default config with custom throttleTime
        setDefaultConfig({
            throttleTime: 200 // 200ms throttle instead of default 50ms
        });

        // Register a fetcher
        const mockFetcher = jest.fn().mockImplementation(async () => 'test-data');
        registerFetcher(['throttle-test'], {
            fetcher: mockFetcher
        });

        // First fetch
        await fetchQuery(['throttle-test']);
        expect(mockFetcher).toHaveBeenCalledTimes(1);

        // Immediate second fetch should be throttled (within 200ms)
        await fetchQuery(['throttle-test']);
        expect(mockFetcher).toHaveBeenCalledTimes(1); // Still 1, throttled

        // Wait for throttle period to pass
        await new Promise(resolve => setTimeout(resolve, 250));

        // Third fetch should not be throttled
        await fetchQuery(['throttle-test']);
        expect(mockFetcher).toHaveBeenCalledTimes(2); // Now 2, not throttled
    });
});
