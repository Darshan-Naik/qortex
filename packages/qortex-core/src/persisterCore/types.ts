import type { QueryStateInternal } from "../queryManager/internal-types";
import type { DefaultConfig } from "../queryManager/types";


export type SerializedQueryState = Omit<QueryStateInternal, 'fetcher' | 'fetchPromise' | 'refetch' | 'equalityFn'>;

/**
 * Complete persisted state structure
 */
export interface PersistedState {
    queries: Record<string, SerializedQueryState>;
    burstKey: string;
    timestamp: number;
    defaultConfig?: DefaultConfig;
}

/**
 * Persister configuration
 */
export interface PersisterConfig {
    burstKey?: string;
    prefix?: string;
    debounceTime?: number;
}



