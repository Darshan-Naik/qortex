import { QueryStateInternal } from "../queryManager/internal-types";


export type SerializedQueryState = Omit<QueryStateInternal, 'fetcher' | 'fetchPromise' | 'refetch' | 'equalityFn'>;

/**
 * Complete persisted state structure
 */
export interface PersistedState {
    entries: Record<string, SerializedQueryState>;
    burstKey: string;
    timestamp: number;
}

/**
 * Persister configuration
 */
export interface PersisterConfig {
    burstKey?: string;
    prefix?: string;
    debounceTime?: number;
}



