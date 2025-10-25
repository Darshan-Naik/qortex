/**
 * Creates a persister instance for data persistence
 * 
 * @param type - Storage type to use ('local' for localStorage, 'session' for sessionStorage)
 * @param config - Optional configuration for the persister
 * @param config.burstKey - Version key to invalidate old cached data (default: '0.3.0')
 * @param config.prefix - Prefix for storage keys (default: 'qortex')
 * @param config.debounceTime - Time in ms to debounce save operations (default: 100)
 * @returns Persister instance or undefined if storage is not available
 * 
 * Creates a persister that can save and load query state data to/from browser storage.
 * Handles serialization, validation, burst key management, and debounced syncing automatically.
 * Returns undefined if the specified storage type is not available in the environment.
 */
export { createPersister } from "./persisterCore";

/**
 * Configuration options for persister instances
 * 
 * @interface PersisterConfig
 * @property burstKey - Version key to invalidate old cached data when breaking changes occur
 * @property prefix - Prefix for storage keys to avoid conflicts with other applications
 * @property debounceTime - Time in milliseconds to debounce save operations for performance
 */
export type { PersisterConfig } from "./persisterCore";

/**
 * Persister interface for data persistence
 * 
 * @interface Persister
 * @method save - Saves query state data to storage
 * @method load - Loads and hydrates query state data from storage
 * @method sync - Synchronizes current cache state to storage
 * @method clear - Clears all persisted data from storage
 */
export type { Persister } from "./persisterCore";
