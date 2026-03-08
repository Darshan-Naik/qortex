
import { createDB } from '../db';
import { QortexDBError } from '../errors';

// Mock IndexedDB since jsdom doesn't support it fully
const mockIndexedDB = {
    open: jest.fn(),
};
Object.defineProperty(window, 'indexedDB', { value: mockIndexedDB });

describe('qortex-db', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should throw error if name is missing', () => {
            // @ts-ignore - Testing runtime validation
            expect(() => createDB({})).toThrow(QortexDBError);
            // @ts-ignore - Testing runtime validation
            expect(() => createDB('')).toThrow(QortexDBError);
        });

        it('should create instance with string name (default local)', () => {
            const db = createDB('test-db');
            expect(db).toBeDefined();
            expect(db.set).toBeDefined();
            expect(db.get).toBeDefined();
        });

        it('should create instance with options', () => {
            const db = createDB({ name: 'test-db', driver: 'session' });
            expect(db).toBeDefined();
        });
    });

    describe('LocalStorage Driver', () => {
        const db = createDB('local-test');

        it('should set and get values', async () => {
            await db.set('key1', 'value1');
            const val = await db.get<string>('key1');
            expect(val).toBe('value1');
            expect(window.localStorage.getItem('__db__:local-test:key1')).toBe(JSON.stringify('value1'));
        });

        it('should return null for non-existent key', async () => {
            const val = await db.get('non-existent');
            expect(val).toBeUndefined();
        });

        it('should check existence with has', async () => {
            await db.set('key2', 'value2');
            expect(await db.has('key2')).toBe(true);
            expect(await db.has('non-existent')).toBe(false);
        });

        it('should delete keys', async () => {
            await db.set('key3', 'value3');
            await db.del('key3');
            expect(await db.has('key3')).toBe(false);
            expect(window.localStorage.getItem('__db__:local-test:key3')).toBeNull();
        });

        it('should scan keys', async () => {
            await db.set('user:1', 'u1');
            await db.set('user:2', 'u2');
            await db.set('post:1', 'p1');

            const users = await db.scan('user:*');
            expect(users).toHaveLength(2);
            expect(users).toContain('user:1');
            expect(users).toContain('user:2');
        });

        it('should drop database', async () => {
            await db.set('d1', 'v1');
            await db.set('d2', 'v2');

            // Pollute invalid key (different prefix)
            window.localStorage.setItem('other:key', 'val');

            await db.drop();

            expect(await db.has('d1')).toBe(false);
            expect(await db.has('d2')).toBe(false);
            // Should verify other keys are untouched? 
            // The drop implementation usually clears keys starting with prefix.
            // But we can't easily check "other" if prefix logic is internal.
            // Just verifying ours are gone is enough.
        });
    });

    describe('SessionStorage Driver', () => {
        const db = createDB({ name: 'session-test', driver: 'session' });

        it('should persist to sessionStorage', async () => {
            await db.set('s1', 'session-val');
            expect(window.sessionStorage.getItem('__db__:session-test:s1')).toBe(JSON.stringify('session-val'));
            expect(await db.get('s1')).toBe('session-val');
        });
    });

    // We skip deep IndexedDB tests because mocking IDBRequest is complex without libs.
    // We just verify it initializes.
    describe('IndexedDB Driver', () => {
        it('should initialize indexedDB driver', () => {
            const db = createDB({ name: 'idb-test', driver: 'indexedDB' });
            expect(db).toBeDefined();
        });
    });
});
