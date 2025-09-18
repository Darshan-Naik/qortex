import QueryManagerCore from "./queryManagerCore";

const _queryManager = new QueryManagerCore();

// Export individual methods for direct usage
export const registerFetcher = _queryManager.registerFetcher.bind(_queryManager);
export const fetchQuery = _queryManager.fetchQuery.bind(_queryManager);
export const setQueryData = _queryManager.setQueryData.bind(_queryManager);
export const getQueryData = _queryManager.getQueryData.bind(_queryManager);
export const getQueryState = _queryManager.getQueryState.bind(_queryManager);
export const invalidateQuery = _queryManager.invalidateQuery.bind(_queryManager);
export const subscribeQuery = _queryManager.subscribeQuery.bind(_queryManager);
export const setDefaultConfig = _queryManager.setDefaultConfig.bind(_queryManager);
export const dangerClearCache = _queryManager.dangerClearCache.bind(_queryManager);

// Also export as queryManager object for backward compatibility
export const queryManager = {
    registerFetcher,
    fetchQuery,
    setQueryData,
    getQueryData,
    getQueryState,
    invalidateQuery,
    subscribeQuery,
    setDefaultConfig,
    dangerClearCache,
    _queryManager
};