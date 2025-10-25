import QueryManagerCore from "./queryManagerCore";

export const _queryManager = new QueryManagerCore();

// Re-export the class
export { QueryManagerCore };

/**
 * Registers a fetcher function for a query key and sets up the query state
 * 
 * @param key - Unique identifier for the query (string or array of primitives)
 * @param opts - Query configuration options
 * @param opts.fetcher - Async function that fetches data for this query
 * @param opts.enabled - Whether the query should be active (default: true)
 * @param opts.staleTime - Time in ms before data is considered stale (default: 0)
 * @param opts.equalityStrategy - How to compare data for changes ('shallow' | 'deep')
 * @param opts.equalityFn - Custom equality function for data comparison
 * @param opts.refetchOnSubscribe - When to refetch on subscription ('always' | 'stale' | false)
 * @param opts.placeholderData - Initial data to show while loading
 * @param opts.usePreviousDataOnError - Keep previous data when error occurs
 * @param opts.usePlaceholderOnError - Use placeholder data when error occurs
 * 
 * Automatically triggers initial fetch if enabled is not false. Enhanced with automatic type inference from fetcher function.
 */
export const registerFetcher = _queryManager.registerFetcher.bind(_queryManager);

/**
 * Executes a fetch operation with proper error handling and state management
 * 
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns Promise that resolves to the fetched data
 * 
 * Prevents duplicate fetches by tracking ongoing promises. Enhanced with automatic type inference from fetcher function.
 * Updates query state with loading, success, or error status. Handles race conditions and concurrent requests.
 */
export const fetchQuery = _queryManager.fetchQuery.bind(_queryManager);

/**
 * Manually sets query data without triggering a fetch operation
 * 
 * @param key - Unique identifier for the query
 * @param data - Data to set for the query
 * 
 * Marks the query as successful and updates the cache. Useful for optimistic updates or setting initial data.
 * Triggers all subscribers with the new data. Does not affect the fetcher function or trigger network requests.
 */
export const setQueryData = _queryManager.setQueryData.bind(_queryManager);

/**
 * Gets the current data for a query
 * 
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns The current data value or undefined if not available
 * 
 * Handles mount logic to potentially start fetching if data is stale or missing.
 * Returns undefined if the query has never been fetched or if an error occurred.
 */
export const getQueryData = _queryManager.getQueryData.bind(_queryManager);

/**
 * Gets the complete query state including loading, error, and computed flags
 * 
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns QueryState object with data, error, status, and computed flags
 * 
 * Returns an object containing:
 * - data: The current data value
 * - error: Any error that occurred during fetching
 * - status: Current status ('idle' | 'fetching' | 'success' | 'error')
 * - isStale: Whether the data is considered stale
 * - isLoading: Whether the query is currently loading
 * - isFetching: Whether a fetch is in progress
 * - isError: Whether the query is in an error state
 * - isSuccess: Whether the query completed successfully
 * - refetch: Function to manually trigger a refetch
 * 
 * Handles mount logic to potentially start fetching if data is stale or missing.
 */
export const getQueryState = _queryManager.getQueryState.bind(_queryManager);

/**
 * Invalidates a query, marking it as stale and triggering a refetch
 * 
 * @param key - Unique identifier for the query
 * 
 * Marks the query as invalidated and immediately triggers a refetch operation.
 * Useful for forcing data refresh after mutations or when you know data is outdated.
 * All subscribers will be notified of the state changes.
 */
export const invalidateQuery = _queryManager.invalidateQuery.bind(_queryManager);

/**
 * Subscribes to query state changes and returns an unsubscribe function
 * 
 * @param key - Unique identifier for the query
 * @param callback - Function called whenever the query state changes
 * @param opts - Optional query configuration (if not already registered)
 * @returns Unsubscribe function to stop receiving updates
 * 
 * The callback receives the current QueryState object. Handles mount logic to potentially start fetching.
 * Returns a cleanup function that should be called when the subscription is no longer needed.
 * Multiple subscribers can be registered for the same query key.
 */
export const subscribeQuery = _queryManager.subscribeQuery.bind(_queryManager);

/**
 * Sets default configuration that applies to all queries
 * 
 * @param config - Default configuration object
 * @param config.enabled - Default enabled state for all queries. Default: `true`
 * @param config.staleTime - Default stale time in milliseconds. Default: `0` (data becomes stale immediately after fetch)
 * @param config.refetchOnSubscribe - Default refetch behavior on subscription. Default: `"stale"`
 * @param config.equalityStrategy - Default equality comparison strategy. Default: `"shallow"`
 * @param config.equalityFn - Default equality function. Default: `Object.is`
 * @param config.usePreviousDataOnError - Default behavior for previous data on error. Default: `false`
 * @param config.usePlaceholderOnError - Default behavior for placeholder data on error. Default: `false`
 * @param config.throttleTime - Time in ms to throttle fetch requests. Default: `50`
 * @param config.persister - Persister instance for data persistence
 * 
 * These defaults will be merged with individual query options. Useful for setting global behavior
 * like default stale times, error handling, or persistence configuration.
 */
export const setDefaultConfig = _queryManager.setDefaultConfig.bind(_queryManager);

/**
 * ⚠️ DANGER: Clear all cached data and subscriptions
 * 
 * This method completely wipes all internal state including:
 * - All cached query data
 * - All active subscriptions
 * - All state references
 * - All persisted data
 * 
 * @warning This should ONLY be used in testing environments or when you need to completely reset the query manager state. Using this in production will cause all active queries to lose their data and subscriptions to break.
 * 
 * @example
 * ```typescript
 * // ✅ Safe usage in tests
 * beforeEach(() => {
 *   dangerClearCache();
 * });
 * 
 * // ❌ Dangerous usage in production
 * // dangerClearCache(); // Don't do this!
 * ```
 */
export const dangerClearCache = _queryManager.dangerClearCache.bind(_queryManager);

