import QueryManagerCore from "./queryManagerCore";

/**
 * The global query manager instance.
 * Use this to interact with the query cache directly.
 *
 * @example
 * ```typescript
 * import { queryManager } from 'qortex-query';
 *
 * queryManager.registerFetcher('users', { fetcher: () => fetch('/api/users') });
 * const users = await queryManager.fetchQuery('users');
 * ```
 */
export const queryManager = new QueryManagerCore();

/**
 * Registers a fetcher function for a query key and sets up the query state.
 * Automatically triggers initial fetch if enabled is not false.
 *
 * @param key - Unique identifier for the query (string or array of primitives)
 * @param opts - Query configuration options including fetcher, staleTime, enabled, etc.
 *
 * @example
 * ```typescript
 * registerFetcher('users', {
 *   fetcher: async () => fetch('/api/users').then(r => r.json()),
 *   staleTime: 60000
 * });
 * ```
 */
export const registerFetcher = queryManager.registerFetcher;

/**
 * Executes a fetch operation with proper error handling and state management.
 * Prevents duplicate fetches by tracking ongoing promises.
 *
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns Promise that resolves to the fetched data
 *
 * @example
 * ```typescript
 * const users = await fetchQuery('users');
 * ```
 */
export const fetchQuery = queryManager.fetchQuery;

/**
 * Manually sets query data without triggering a fetch operation.
 * Useful for optimistic updates or setting initial data.
 *
 * @param key - Unique identifier for the query
 * @param dataOrUpdater - Data to set, or an updater function that receives previous data
 *
 * @example
 * ```typescript
 * // Direct update
 * setQueryData('user', { id: 1, name: 'John' });
 *
 * // Functional update - access previous data
 * setQueryData('user', (prev) => ({ ...prev, name: 'Jane' }));
 *
 * // Increment counter example
 * setQueryData('counter', (prev) => (prev ?? 0) + 1);
 * ```
 */
export const setQueryData = queryManager.setQueryData;

/**
 * Gets the current data for a query.
 * Returns undefined if the query has never been fetched or if an error occurred.
 *
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns The current data value or undefined if not available
 *
 * @example
 * ```typescript
 * const users = getQueryData('users');
 * ```
 */
export const getQueryData = queryManager.getQueryData;

/**
 * Gets the complete query state including loading, error, and computed flags.
 *
 * @param key - Unique identifier for the query
 * @param opts - Optional query configuration (if not already registered)
 * @returns QueryState object with data, error, status, isLoading, isFetching, isError, isSuccess, isStale, and refetch
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = getQueryState('users');
 * ```
 */
export const getQueryState = queryManager.getQueryState;

/**
 * Invalidates a query, marking it as stale and triggering a refetch.
 * Useful for forcing data refresh after mutations.
 *
 * @param key - Unique identifier for the query
 *
 * @example
 * ```typescript
 * await updateUser(userId, newData);
 * invalidateQuery('users');
 * ```
 */
export const invalidateQuery = queryManager.invalidateQuery;

/**
 * Subscribes to query state changes and returns an unsubscribe function.
 *
 * @param key - Unique identifier for the query
 * @param cb - Function called whenever the query state changes
 * @param opts - Optional query configuration (if not already registered)
 * @returns Unsubscribe function to stop receiving updates
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeQuery('users', (state) => {
 *   console.log('Users state changed:', state);
 * });
 * unsubscribe(); // When done
 * ```
 */
export const subscribeQuery = queryManager.subscribeQuery;

/**
 * Sets default configuration that applies to all queries.
 *
 * @param config - Default configuration object (staleTime, enabled, refetchOnSubscribe, throttleTime, persister, etc.)
 *
 * @example
 * ```typescript
 * setDefaultConfig({
 *   staleTime: 5000,
 *   refetchOnSubscribe: 'stale'
 * });
 * ```
 */
export const setDefaultConfig = queryManager.setDefaultConfig;

/**
 * ⚠️ DANGER: Clear all cached data and subscriptions.
 * Only use in testing environments!
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   dangerClearCache();
 * });
 * ```
 */
export const dangerClearCache = queryManager.dangerClearCache;

// Re-export the class for advanced use cases
export { QueryManagerCore };
