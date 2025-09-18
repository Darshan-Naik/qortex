import QueryManagerCore from "./queryManagerCore";

const _queryManager = new QueryManagerCore();

export const queryManager = {
    registerFetcher: _queryManager.registerFetcher.bind(_queryManager),
    fetchQuery: _queryManager.fetchQuery.bind(_queryManager),
    setQueryData: _queryManager.setQueryData.bind(_queryManager),
    getQueryData: _queryManager.getQueryData.bind(_queryManager),
    getQueryState: _queryManager.getQueryState.bind(_queryManager),
    invalidateQuery: _queryManager.invalidateQuery.bind(_queryManager),
    subscribeQuery: _queryManager.subscribeQuery.bind(_queryManager),
    setDefaultConfig: _queryManager.setDefaultConfig.bind(_queryManager),
    dangerClearCache: _queryManager.dangerClearCache.bind(_queryManager),
    _queryManager
};