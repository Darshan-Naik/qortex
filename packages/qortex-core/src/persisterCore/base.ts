import { PersisterConfig } from './types';
import { SerializedQueryState, PersistedState } from './types';
import { toSerializableState, fromSerializableState, warnPersisterAfterQueriesUsed, safeParseJSON } from './utils';
import type { QueryStateInternal } from '../queryManager/internal-types';
import type { DefaultConfig } from '../queryManager/types';

/**
 * Base persister implementation
 */
export class BasePersister {
    protected readonly storage: Storage;
    private syncTimeout: ReturnType<typeof setTimeout> | null = null;
    private debounceTime = 100
    private burstKey = '0.3.0'
    private storageKey = 'qortex';

    constructor(
        storage: Storage,
        config?: PersisterConfig
    ) {
        this.storage = storage;
        this.burstKey = config?.burstKey ?? this.burstKey;
        this.storageKey = config?.prefix ?? this.storageKey;
        this.debounceTime = config?.debounceTime ?? this.debounceTime;
    }

    /**
     * Save state to storage
     */
    save(state: Record<string, SerializedQueryState>, defaultConfig?: DefaultConfig): void {
        try {
            const persistedState: PersistedState = {
                queries: {},
                burstKey: this.burstKey,
                timestamp: Date.now(),
                defaultConfig: defaultConfig
            };

            // Convert internal state to persisted queries
            for (const [key, queryState] of Object.entries(state)) {
                persistedState.queries[key] = queryState
            }

            const serialized = JSON.stringify(persistedState);
            this.storage.setItem(this.storageKey, serialized);
        } catch (error) {
            console.warn(`[Qortex] Failed to persist state:`, error);
        }
    }

    /**
     * Load state from storage and hydrate cache
     */
    load(cache: Map<string, QueryStateInternal>, hasQueriesBeenUsed: boolean, currentDefaultConfig?: DefaultConfig): void {
        if (hasQueriesBeenUsed) {
            warnPersisterAfterQueriesUsed()
        }
        try {
            const serialized = this.storage.getItem(this.storageKey);
            if (!serialized) {
                return;
            }

            const persistedState = safeParseJSON(serialized);
            if (!persistedState) {
                console.warn(`[Qortex] Invalid persisted state format, clearing cache`);
                this.clear();
                return;
            }

            // Check burst key compatibility
            if (persistedState.burstKey !== this.burstKey) {
                console.warn(`[Qortex] Burst key mismatch, clearing cache`);
                this.clear();
                return;
            }

            // Check if default config has changed
            const storedDefaultConfig = persistedState.defaultConfig || {};
            const hasDefaultConfigChanged = this.hasDefaultConfigChanged(storedDefaultConfig, currentDefaultConfig);

            // Hydrate cache with persisted states
            for (const [key, query] of Object.entries(persistedState.queries)) {
                const serializableState = query;
                const existingState = cache.get(key);
                const internalState = fromSerializableState(serializableState, existingState);

                // Only update with new default config if it has changed
                if (hasDefaultConfigChanged) {
                    Object.keys(currentDefaultConfig).forEach(configKey => {
                        const newDefaultValue = currentDefaultConfig[configKey];
                        if (newDefaultValue !== undefined) {
                            (internalState as any)[configKey] = newDefaultValue;
                        }
                    });

                    // Ensure enabled state is properly set
                    internalState.enabled = currentDefaultConfig.enabled === false ? false : true;
                }

                cache.set(key, internalState);
            }
        } catch (error) {
            console.warn(`[Qortex] Failed to load persisted state:`, error);
            this.clear();
        }
    }

    /**
     * Checks if the default config has changed by comparing stored and current configs
     */
    private hasDefaultConfigChanged(storedConfig: DefaultConfig, currentConfig: DefaultConfig): boolean {
        // If no stored config, consider it changed (first time)
        if (!storedConfig || Object.keys(storedConfig).length === 0) {
            return true;
        }

        // Check if any property in current config differs from stored config
        return Object.keys(currentConfig).some(key =>
            storedConfig[key] !== currentConfig[key]
        );
    }

    /**
     * Clear all persisted data
     */
    clear(): void {
        try {
            this.storage.removeItem(this.storageKey);
        } catch (error) {
            console.warn(`[Qortex] Failed to clear persisted data:`, error);
        }
    }

    /**
     * Sync with debounced save (100ms delay)
     * Handles serialization internally
     */
    sync(cache: Map<string, QueryStateInternal>, defaultConfig?: DefaultConfig): void {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        this.syncTimeout = setTimeout(() => {
            // Serialize cache to serializable state
            const serializableStates: Record<string, SerializedQueryState> = {};

            for (const [key, state] of cache.entries()) {
                // Key is already serialized by the query manager, so we use it directly
                serializableStates[key] = toSerializableState(state);
            }

            this.save(serializableStates, defaultConfig);
        }, this.debounceTime);
    }

}

export type Persister = BasePersister;
