/**
 * Tests for the Persister interface integration with QueryManagerCore.
 *
 * createPersister has been removed from qortex-query.
 * Persistence is now provided by createQueryPersister from qortex-db.
 *
 * These tests use a lightweight in-memory mock persister that satisfies
 * the Persister interface, keeping the suite fast and dependency-free.
 */
import { QueryManagerCore } from '../src/queryManager/queryManagerCore';
import type { Persister } from '../src/queryManager/types';

// ─── Mock Persister ───────────────────────────────────────────────────────────

/**
 * Simple in-memory implementation of the Persister interface.
 * Behaves like a real persister (debounced sync, burst key, persist flag)
 * without needing a real storage backend.
 */
const createMockPersister = (burstKey = 'v1', debounceTime = 50): Persister & { _store: Record<string, unknown>; _clear: () => void } => {
    let store: Record<string, unknown> = {};
    let syncTimer: ReturnType<typeof setTimeout> | null = null;

    const persister = {
        _store: store,
        _clear() { store = {}; persister._store = store; },

        load(cache: Map<string, unknown>, hasQueriesBeenUsed: boolean): void {
            if (hasQueriesBeenUsed) {
                console.warn('[Qortex DB] Persister configured after queries were already used.');
            }
            const saved = store['__cache__'] as any;
            if (!saved) return;
            if (saved.burstKey !== burstKey) { delete store['__cache__']; return; }
            for (const [key, qs] of Object.entries(saved.queries ?? {})) {
                const existing = cache.get(key);
                cache.set(key, { ...(existing ?? {}), ...(qs as object), fromPersisterCache: !existing });
            }
        },

        sync(cache: Map<string, unknown>): void {
            if (syncTimer) clearTimeout(syncTimer);
            syncTimer = setTimeout(() => {
                const queries: Record<string, unknown> = {};
                for (const [key, entry] of cache.entries()) {
                    const s = entry as Record<string, unknown>;
                    if (s['persist'] === false) continue;
                    const { fetcher: _f, equalityFn: _e, fetchPromise: _fp, refetch: _r, fromPersisterCache: _fpc, ...serialized } = s;
                    queries[key] = serialized;
                }
                store['__cache__'] = { burstKey, timestamp: Date.now(), queries };
            }, debounceTime);
        },

        clear(): void {
            delete store['__cache__'];
        },
    };
    return persister;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Persister Integration', () => {
    let queryManager: QueryManagerCore;

    beforeEach(() => {
        queryManager = new QueryManagerCore();
    });

    describe('Basic Persistence', () => {
        it('should persist and load data across query manager instances', async () => {
            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Test' })
            });

            const data = await queryManager.fetchQuery('test-query');
            expect(data).toEqual({ id: 1, name: 'Test' });

            // Wait for debounced sync
            await new Promise(r => setTimeout(r, 100));

            // New manager with same persister (shared store)
            const newManager = new QueryManagerCore();
            newManager.setDefaultConfig({ persister });
            newManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            const loaded = newManager.getQueryData('test-query');
            expect(loaded).toEqual({ id: 1, name: 'Test' }); // from persistence
        });
    });

    describe('Burst Key Functionality', () => {
        it('should invalidate cache when burst key changes', async () => {
            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1, name: 'Old' })
            });
            await queryManager.fetchQuery('test-query');
            await new Promise(r => setTimeout(r, 100));

            // New manager with different burst key — stale cache discarded
            const newPersister = createMockPersister('v2'); // different burst key, but shares store
            // Copy the store from persister to newPersister to simulate shared storage
            newPersister._store['__cache__'] = persister._store['__cache__'];

            const newManager = new QueryManagerCore();
            newManager.setDefaultConfig({ persister: newPersister });
            newManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 2, name: 'Fresh' })
            });

            const freshData = await newManager.fetchQuery('test-query');
            expect(freshData).toEqual({ id: 2, name: 'Fresh' }); // re-fetched
        });
    });

    describe('Warning System', () => {
        it('should warn when persister is set after queries have been used', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            queryManager.registerFetcher('test-query', {
                fetcher: async () => ({ id: 1 })
            });
            queryManager.getQueryData('test-query');

            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('after queries were already used')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('Per-Query Persist Flag', () => {
        it('should not persist queries with persist: false', async () => {
            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            queryManager.registerFetcher('persist-query', {
                fetcher: async () => ({ id: 1, name: 'Persisted' })
            });
            queryManager.registerFetcher('no-persist-query', {
                fetcher: async () => ({ id: 2, name: 'Ephemeral' }),
                persist: false
            });

            await queryManager.fetchQuery('persist-query');
            await queryManager.fetchQuery('no-persist-query');
            await new Promise(r => setTimeout(r, 100));

            const saved = persister._store['__cache__'] as any;
            expect(saved.queries['persist-query']).toBeDefined();
            expect(saved.queries['no-persist-query']).toBeUndefined();
        });

        it('should persist multiple queries while excluding opted-out ones', async () => {
            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            queryManager.registerFetcher('user-profile', { fetcher: async () => ({ id: 1 }) });
            queryManager.registerFetcher('settings', { fetcher: async () => ({ theme: 'dark' }) });
            queryManager.registerFetcher('auth-token', { fetcher: async () => ({ token: 'secret' }), persist: false });
            queryManager.registerFetcher('temp-data', { fetcher: async () => ({ temp: true }), persist: false });

            await Promise.all([
                queryManager.fetchQuery('user-profile'),
                queryManager.fetchQuery('settings'),
                queryManager.fetchQuery('auth-token'),
                queryManager.fetchQuery('temp-data'),
            ]);
            await new Promise(r => setTimeout(r, 100));

            const saved = persister._store['__cache__'] as any;
            expect(Object.keys(saved.queries)).toHaveLength(2);
            expect(saved.queries['user-profile']).toBeDefined();
            expect(saved.queries['settings']).toBeDefined();
            expect(saved.queries['auth-token']).toBeUndefined();
            expect(saved.queries['temp-data']).toBeUndefined();
        });

        it('should default persist to true when not specified', async () => {
            const persister = createMockPersister('v1');
            queryManager.setDefaultConfig({ persister });

            queryManager.registerFetcher('default-query', {
                fetcher: async () => ({ data: 'test' })
            });
            await queryManager.fetchQuery('default-query');
            await new Promise(r => setTimeout(r, 100));

            const saved = persister._store['__cache__'] as any;
            expect(saved.queries['default-query']).toBeDefined();
            expect(saved.queries['default-query'].data).toEqual({ data: 'test' });
        });
    });

    describe('Config Value Handling', () => {
        it('loads persisted data and uses current default config (staleTime etc.)', async () => {
            const persister = createMockPersister('v1');
            const fetcher = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });

            const qm1 = new QueryManagerCore();
            qm1.setDefaultConfig({ persister, staleTime: 1000 });
            qm1.registerFetcher('test-query', { fetcher });
            await qm1.fetchQuery('test-query');
            await new Promise(r => setTimeout(r, 100));

            // Second manager reuses same persister (same shared store)
            const qm2 = new QueryManagerCore();
            qm2.setDefaultConfig({ persister, staleTime: 5000 });
            qm2.registerFetcher('test-query', { fetcher });
            const loaded = qm2.getQueryData('test-query', { fetcher });

            expect(loaded).toEqual({ id: 1, name: 'Test' });
            expect(fetcher).toHaveBeenCalledTimes(1); // no extra fetch
        });
    });
});
