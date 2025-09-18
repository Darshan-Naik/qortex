import QueryManagerCore from "./queryManagerCore";

export const _queryManager = new QueryManagerCore();

// Export individual methods for direct usage with proper generic typing
export const registerFetcher = _queryManager.registerFetcher.bind(_queryManager) as QueryManagerCore['registerFetcher'];
export const fetchQuery = _queryManager.fetchQuery.bind(_queryManager) as QueryManagerCore['fetchQuery'];
export const setQueryData = _queryManager.setQueryData.bind(_queryManager) as QueryManagerCore['setQueryData'];
export const getQueryData = _queryManager.getQueryData.bind(_queryManager) as QueryManagerCore['getQueryData'];
export const getQueryState = _queryManager.getQueryState.bind(_queryManager) as QueryManagerCore['getQueryState'];
export const invalidateQuery = _queryManager.invalidateQuery.bind(_queryManager) as QueryManagerCore['invalidateQuery'];
export const subscribeQuery = _queryManager.subscribeQuery.bind(_queryManager) as QueryManagerCore['subscribeQuery'];
export const setDefaultConfig = _queryManager.setDefaultConfig.bind(_queryManager) as QueryManagerCore['setDefaultConfig'];
export const dangerClearCache = _queryManager.dangerClearCache.bind(_queryManager) as QueryManagerCore['dangerClearCache'];

