import { BasePersister, Persister } from './base';

import type { PersisterConfig } from './types';
import { warnNoStorage } from './utils';

export type { PersisterConfig } from './types';

const getStorage = (type: 'local' | 'session') => {
    switch (type) {
        case 'local':
            if (typeof localStorage !== 'undefined') {
                return window.localStorage
            }
            break;
        case 'session':
            if (typeof sessionStorage !== 'undefined') {
                return window.sessionStorage
            }
            break;
        default:
            throw new Error(`Invalid storage type: ${type}`);
    }
}

/**
 * Creates a persister instance for data persistence.
 * 
 * This factory function creates a persister that can save and load query state data
 * to/from browser storage (localStorage or sessionStorage). The persister handles
 * serialization, validation, burst key management, and debounced syncing automatically.
 * 
 * @param {'local' | 'session'} type - The type of storage to use
 *   - `'local'`: Uses localStorage for persistent data across browser sessions
 *   - `'session'`: Uses sessionStorage for data that persists only during the current session
 * @param {PersisterConfig} [config] - Optional configuration for the persister
 * @returns {Persister | undefined} A persister instance, or undefined if storage is not available
 * 
 * @example
 * ```typescript
 * // Basic usage with localStorage
 * const persister = createPersister('local');
 * 
 * // With custom configuration
 * const persister = createPersister('local', {
 *   burstKey: 'v1.0.0',
 *   prefix: 'my_app',
 *   debounceTime: 50
 * });
 * 
 * // Use with query manager
 * setDefaultConfig({ persister });
 * ```
 * 
 * @example
 * ```typescript
 * // Session storage for temporary data
 * const sessionPersister = createPersister('session', {
 *   prefix: 'temp_data',
 *   debounceTime: 200
 * });
 * 
 * setDefaultConfig({ persister: sessionPersister });
 * ```
 * 
 * @throws {Error} If an invalid storage type is provided
 */
export const createPersister = (type: 'local' | 'session', config?: PersisterConfig) => {
    const storage = getStorage(type)
    if (!storage) {
        warnNoStorage()
        return;
    }
    return new BasePersister(storage, config)
}

export type { Persister };