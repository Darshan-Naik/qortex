import { QueryManagerCore } from '../src/queryManager/queryManagerCore';
import { createPersister } from '../src/persister';
import { BasePersister } from '../src/persisterCore/base';

// Mock localStorage and sessionStorage
const mockStorage = () => {
    const store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(key => delete store[key]); }
    };
};

// Mock global window and storage APIs for node environment
const mockWindow = {
    localStorage: mockStorage(),
    sessionStorage: mockStorage()
};

// @ts-ignore
global.window = mockWindow;
// @ts-ignore
global.localStorage = mockWindow.localStorage;
// @ts-ignore
global.sessionStorage = mockWindow.sessionStorage;

describe('Persister Integration', () => {
    let queryManager: QueryManagerCore;

    beforeEach(() => {
        queryManager = new QueryManagerCore();
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('Basic Persistence', () => {
        it('should persist and load data with localStorage', async () => {
            // Set up persister
            const persister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'test'
            });
            queryManager.setDefaultConfig({
                persister
            });

            // Register a fetcher and fetch data
            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });

            // Fetch data - should be persisted
            const data = await queryManager.fetchQuery('test-query');
            expect(data).toEqual({ id: 1, name: 'Test' });

            // Wait for debounced sync to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Create new query manager instance
            const newQueryManager = new QueryManagerCore();
            const newPersister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'test'
            });
            newQueryManager.setDefaultConfig({
                persister: newPersister
            });

            // Register fetcher and get data - should load from persistence
            newQueryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            const loadedData = newQueryManager.getQueryData('test-query');
            expect(loadedData).toEqual({ id: 1, name: 'Test' });
        });

        it('should persist and load data with sessionStorage', async () => {
            // Set up persister
            const persister = createPersister('session', {
                burstKey: 'v1.0.0',
                prefix: 'test'
            });
            queryManager.setDefaultConfig({
                persister
            });

            // Register a fetcher and fetch data
            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });

            // Fetch data - should be persisted
            const data = await queryManager.fetchQuery('test-query');
            expect(data).toEqual({ id: 1, name: 'Test' });

            // Wait for debounced sync to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Create new query manager instance
            const newQueryManager = new QueryManagerCore();
            const newPersister = createPersister('session', {
                burstKey: 'v1.0.0',
                prefix: 'test'
            });
            newQueryManager.setDefaultConfig({
                persister: newPersister
            });

            // Register fetcher and get data - should load from persistence
            newQueryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            const loadedData = newQueryManager.getQueryData('test-query');
            expect(loadedData).toEqual({ id: 1, name: 'Test' });
        });
    });

    describe('Burst Key Functionality', () => {
        it('should invalidate cache when burst key changes', async () => {
            // Set up persister
            const persister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'test'
            });
            queryManager.setDefaultConfig({
                persister
            });

            // Register a fetcher and fetch data
            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });

            // Fetch data - should be persisted
            const data = await queryManager.fetchQuery('test-query');
            expect(data).toEqual({ id: 1, name: 'Test' });

            // Wait for debounced sync to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Create new query manager instance with new burst key
            const newQueryManager = new QueryManagerCore();
            const newPersister = createPersister('local', {
                burstKey: 'v2.0.0',  // Different burst key
                prefix: 'test'
            });
            newQueryManager.setDefaultConfig({
                persister: newPersister
            });

            // Register fetcher and fetch fresh data - should fetch fresh because burst key changed
            newQueryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            const loadedData = await newQueryManager.fetchQuery('test-query');
            expect(loadedData).toEqual({ id: 2, name: 'Fresh' });
        });
    });

    describe('Warning System', () => {
        it('should warn when persister is set after queries have been used', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Use queries first
            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });
            queryManager.getQueryData('test-query');

            // Set persister after queries have been used
            const persister = createPersister('local', {
                burstKey: 'v1.0.0'
            });
            queryManager.setDefaultConfig({
                persister
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Persister is being set after queries have been used')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Configuration Options', () => {
        it('should allow configuring debounce time', async () => {
            // Set up persister with custom debounce time
            const persister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'debounce-test',
                debounceTime: 50 // Custom debounce time
            });
            queryManager.setDefaultConfig({
                persister
            });

            // Register a fetcher and fetch data
            queryManager.registerFetcher('debounce-query', {
                fetcher: async () => ({ id: 1, name: 'DebounceTest' })
            });

            const data = await queryManager.fetchQuery('debounce-query');
            expect(data).toEqual({ id: 1, name: 'DebounceTest' });

            // Wait for custom debounced sync to complete (50ms + buffer)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify data was persisted
            const storedData = localStorage.getItem('debounce-test');
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData!);
            expect(parsedData.queries['debounce-query'].data).toEqual({ id: 1, name: 'DebounceTest' });
        });

        it('should use default debounce time when not specified', async () => {
            // Set up persister without debounce time (should use default 100ms)
            const persister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'default-test'
                // No debounceTime specified
            });
            queryManager.setDefaultConfig({
                persister
            });

            // Register a fetcher and fetch data
            queryManager.registerFetcher('default-query', {
                fetcher: async () => ({ id: 2, name: 'DefaultTest' })
            });

            const data = await queryManager.fetchQuery('default-query');
            expect(data).toEqual({ id: 2, name: 'DefaultTest' });

            // Wait for default debounced sync to complete (100ms + buffer)
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify data was persisted
            const storedData = localStorage.getItem('default-test');
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData!);
            expect(parsedData.queries['default-query'].data).toEqual({ id: 2, name: 'DefaultTest' });
        });
    });

    describe('Error Handling', () => {
        it('should handle storage errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Create a mock storage that throws errors
            const mockStorage = {
                getItem: () => { throw new Error('Storage error'); },
                setItem: () => { throw new Error('Storage error'); },
                removeItem: () => { throw new Error('Storage error'); },
                clear: () => { throw new Error('Storage error'); },
                length: 0,
                key: () => null
            } as Storage;

            // Create persister with mock storage directly
            const persister = new BasePersister(mockStorage, {
                burstKey: 'v1.0.0'
            });

            queryManager.setDefaultConfig({
                persister
            });

            // Register and use queries - should not throw
            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });
            const data = await queryManager.fetchQuery('test-query');

            expect(data).toEqual({ id: 1, name: 'Test' });

            // Wait for debounced sync to complete and trigger storage errors
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Per-Query Persist Flag', () => {
        it('should not persist queries with persist: false', async () => {
            const store: Record<string, string> = {};
            const mockStorage = {
                getItem: jest.fn((key: string) => store[key] || null),
                setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
                removeItem: jest.fn((key: string) => { delete store[key]; }),
                clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
                length: 0,
                key: () => null
            } as Storage;

            const persister = new BasePersister(mockStorage, {
                burstKey: 'v1.0.0',
                prefix: 'persist-flag-test'
            });

            const queryManager = new QueryManagerCore();
            queryManager.setDefaultConfig({ persister });

            // Register a query that should be persisted (default)
            queryManager.registerFetcher('persist-query', {
                fetcher: async () => ({ id: 1, name: 'Persisted' })
            });

            // Register a query that should NOT be persisted
            queryManager.registerFetcher('no-persist-query', {
                fetcher: async () => ({ id: 2, name: 'NotPersisted' }),
                persist: false
            });

            // Fetch both queries
            await queryManager.fetchQuery('persist-query');
            await queryManager.fetchQuery('no-persist-query');

            // Wait for debounced sync
            await new Promise(resolve => setTimeout(resolve, 150));

            // Check what was persisted
            const storedData = store['persist-flag-test'];
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData);

            // persist-query should be in storage
            expect(parsedData.queries['persist-query']).toBeDefined();
            expect(parsedData.queries['persist-query'].data).toEqual({ id: 1, name: 'Persisted' });

            // no-persist-query should NOT be in storage
            expect(parsedData.queries['no-persist-query']).toBeUndefined();
        });

        it('should skip specific queries from persistence while persisting others', async () => {
            const store: Record<string, string> = {};
            const mockStorage = {
                getItem: jest.fn((key: string) => store[key] || null),
                setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
                removeItem: jest.fn((key: string) => { delete store[key]; }),
                clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
                length: 0,
                key: () => null
            } as Storage;

            const persister = new BasePersister(mockStorage, {
                burstKey: 'v1.0.0',
                prefix: 'selective-persist'
            });

            const queryManager = new QueryManagerCore();
            queryManager.setDefaultConfig({ persister });

            // Persisted queries
            queryManager.registerFetcher('user-profile', {
                fetcher: async () => ({ id: 1, name: 'John' })
            });
            queryManager.registerFetcher('settings', {
                fetcher: async () => ({ theme: 'dark' })
            });

            // Non-persisted queries (sensitive or temporary data)
            queryManager.registerFetcher('auth-token', {
                fetcher: async () => ({ token: 'secret123' }),
                persist: false
            });
            queryManager.registerFetcher('temp-data', {
                fetcher: async () => ({ temp: true }),
                persist: false
            });

            // Fetch all queries
            await Promise.all([
                queryManager.fetchQuery('user-profile'),
                queryManager.fetchQuery('settings'),
                queryManager.fetchQuery('auth-token'),
                queryManager.fetchQuery('temp-data')
            ]);

            // Wait for debounced sync
            await new Promise(resolve => setTimeout(resolve, 150));

            const parsedData = JSON.parse(store['selective-persist']);

            // Persisted queries should be stored
            expect(Object.keys(parsedData.queries)).toHaveLength(2);
            expect(parsedData.queries['user-profile']).toBeDefined();
            expect(parsedData.queries['settings']).toBeDefined();

            // Non-persisted queries should not be stored
            expect(parsedData.queries['auth-token']).toBeUndefined();
            expect(parsedData.queries['temp-data']).toBeUndefined();
        });

        it('should default persist to true when not specified', async () => {
            const store: Record<string, string> = {};
            const mockStorage = {
                getItem: jest.fn((key: string) => store[key] || null),
                setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
                removeItem: jest.fn((key: string) => { delete store[key]; }),
                clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
                length: 0,
                key: () => null
            } as Storage;

            const persister = new BasePersister(mockStorage, {
                burstKey: 'v1.0.0',
                prefix: 'default-persist'
            });

            const queryManager = new QueryManagerCore();
            queryManager.setDefaultConfig({ persister });

            // Register without persist option (should default to true)
            queryManager.registerFetcher('default-query', {
                fetcher: async () => ({ data: 'test' })
            });

            await queryManager.fetchQuery('default-query');
            await new Promise(resolve => setTimeout(resolve, 150));

            const parsedData = JSON.parse(store['default-persist']);
            expect(parsedData.queries['default-query']).toBeDefined();
            expect(parsedData.queries['default-query'].data).toEqual({ data: 'test' });
        });
    });

    describe('Config Value Handling', () => {
        it('should load data from persistence but use current default config', async () => {
            const store: Record<string, string> = {};
            const mockStorage = {
                getItem: jest.fn((key: string) => store[key] || null),
                setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
                removeItem: jest.fn((key: string) => { delete store[key]; }),
                clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
                length: 0,
                key: () => null
            } as Storage;

            // First, create a query manager and fetch data
            const persister1 = new BasePersister(mockStorage, {
                burstKey: 'v1.0.0',
                prefix: 'test-persister'
            });

            const queryManager1 = new QueryManagerCore();
            queryManager1.setDefaultConfig({
                persister: persister1,
                staleTime: 1000
            });

            // Create a query and fetch data
            const fetcher = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });
            queryManager1.registerFetcher('test-query', { fetcher });
            await queryManager1.fetchQuery('test-query');

            // Verify data was fetched
            const data1 = queryManager1.getQueryData('test-query', { fetcher });
            expect(data1).toEqual({ id: 1, name: 'Test' });

            // Wait for persister to save data
            await new Promise(resolve => setTimeout(resolve, 150));

            // Now create a new query manager with different default config
            const queryManager2 = new QueryManagerCore();
            queryManager2.setDefaultConfig({
                persister: persister1, // Same persister, so it will load the persisted data
                staleTime: 5000
            });

            // Create the same query - it should load data from persistence
            queryManager2.registerFetcher('test-query', { fetcher });
            const data2 = queryManager2.getQueryData('test-query', { fetcher });

            // The data should be loaded from persistence
            expect(data2).toEqual({ id: 1, name: 'Test' });

            // The fetcher should not be called again because data is loaded from persistence
            expect(fetcher).toHaveBeenCalledTimes(1);
        });
    });
});
