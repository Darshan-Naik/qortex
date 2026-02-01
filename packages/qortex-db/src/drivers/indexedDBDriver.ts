import type { Driver } from "../types";
import { QortexDBError, wrapError } from "../errors";

const STORE = "kv";

const openDB = (name: string): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        const req = indexedDB.open(name, 1);
        req.onerror = () => reject(new QortexDBError(`Failed to open IndexedDB: ${name}`));
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(STORE)) {
                req.result.createObjectStore(STORE, { keyPath: "key" });
            }
        };
    });

export const createIndexedDBDriver = (dbName: string): Driver => {
    let db: Promise<IDBDatabase> | null = null;

    const getDB = () => (db ??= openDB(dbName));

    const withStore = async <T>(mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
        const d = await getDB();
        return new Promise((resolve, reject) => {
            const req = op(d.transaction(STORE, mode).objectStore(STORE));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    };

    return {
        async get<T>(key: string) {
            try {
                const r = await withStore<{ key: string; value: T } | undefined>("readonly", (s) => s.get(key));
                return r?.value;
            } catch (e) {
                throw wrapError(e, "IndexedDB get failed");
            }
        },

        async set<T>(key: string, value: T) {
            try {
                await withStore("readwrite", (s) => s.put({ key, value }));
            } catch (e) {
                throw wrapError(e, "IndexedDB set failed");
            }
        },

        async del(key: string) {
            try {
                await withStore("readwrite", (s) => s.delete(key));
            } catch (e) {
                throw wrapError(e, "IndexedDB del failed");
            }
        },

        async has(key: string) {
            try {
                const r = await withStore<{ key: string } | undefined>("readonly", (s) => s.get(key));
                return r !== undefined;
            } catch (e) {
                throw wrapError(e, "IndexedDB has failed");
            }
        },

        async keys() {
            try {
                return await withStore<string[]>("readonly", (s) => s.getAllKeys() as IDBRequest<string[]>);
            } catch (e) {
                throw wrapError(e, "IndexedDB keys failed");
            }
        },

        async drop() {
            try {
                (await getDB()).close();
                db = null;
                await new Promise<void>((resolve, reject) => {
                    const req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(new QortexDBError(`Failed to delete IndexedDB: ${dbName}`));
                });
            } catch (e) {
                throw wrapError(e, "IndexedDB drop failed");
            }
        },
    };
};
