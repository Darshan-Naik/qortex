import type { Driver } from "../types";
import { wrapError } from "../errors";

/**
 * Creates a driver for Web Storage API (localStorage or sessionStorage)
 */
export const createWebStorageDriver = (
    storage: Storage,
    prefix: string,
    storageName: string
): Driver => {
    const prefixedKey = (key: string) => `${prefix}${key}`;

    return {
        async get<T>(key: string) {
            try {
                const item = storage.getItem(prefixedKey(key));
                return item === null ? undefined : (JSON.parse(item) as T);
            } catch (error) {
                throw wrapError(error, `Failed to get value from ${storageName}`);
            }
        },

        async set<T>(key: string, value: T) {
            try {
                storage.setItem(prefixedKey(key), JSON.stringify(value));
            } catch (error) {
                throw wrapError(error, `Failed to set value in ${storageName}`);
            }
        },

        async del(key: string) {
            try {
                storage.removeItem(prefixedKey(key));
            } catch (error) {
                throw wrapError(error, `Failed to delete value from ${storageName}`);
            }
        },

        async has(key: string) {
            return storage.getItem(prefixedKey(key)) !== null;
        },

        async keys() {
            const result: string[] = [];
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key?.startsWith(prefix)) {
                    result.push(key.slice(prefix.length));
                }
            }
            return result;
        },

        async drop() {
            try {
                const toDelete: string[] = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key?.startsWith(prefix)) toDelete.push(key);
                }
                toDelete.forEach((key) => storage.removeItem(key));
            } catch (error) {
                throw wrapError(error, `Failed to drop ${storageName} data`);
            }
        },
    };
};
