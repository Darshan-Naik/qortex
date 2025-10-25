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

    describe('Default Config Changes', () => {
        it('should update persisted queries with new default config when persister loads', async () => {
            // First, create a query manager with initial config and persist data
            const initialQueryManager = new QueryManagerCore();
            const persister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'config-test'
            });

            initialQueryManager.setDefaultConfig({
                persister,
                staleTime: 1000
            });

            // Register and fetch a query
            initialQueryManager.registerFetcher('config-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });

            await initialQueryManager.fetchQuery('config-query');

            // Wait for initial sync
            await new Promise(resolve => setTimeout(resolve, 150));

            // Now create a new query manager with different default config
            // This simulates the real-world scenario where the app restarts with new defaults
            const newQueryManager = new QueryManagerCore();
            const newPersister = createPersister('local', {
                burstKey: 'v1.0.0',
                prefix: 'config-test'
            });

            newQueryManager.setDefaultConfig({
                persister: newPersister,
                staleTime: 5000 // New staleTime
            });

            // Register the same fetcher
            newQueryManager.registerFetcher('config-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            // Get the query data - should load from persistence with new default config
            const data = newQueryManager.getQueryData('config-query');
            expect(data).toEqual({ id: 1, name: 'Test' }); // Should load persisted data

            // Wait for any sync to complete
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify the query was updated with new default config
            const storedData = localStorage.getItem('config-test');
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData!);
            expect(parsedData.queries['config-query']).toBeDefined();
            expect(parsedData.queries['config-query'].staleTime).toBe(5000);
        });
    });
});
