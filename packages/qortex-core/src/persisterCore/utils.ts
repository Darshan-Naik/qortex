import type { QueryStateInternal } from '../queryManager/internal-types';
import type { PersistedState, SerializedQueryState } from './types';
import { validatePersistedState } from './validator';

/**
 * Convert internal query state to serializable state
 * Removes non-serializable properties like functions and promises
 */
export function toSerializableState<T = any>(state: QueryStateInternal<T>): SerializedQueryState {
    const { fetcher, equalityFn, fetchPromise, refetch, fromPersisterCache, ...serializable } = state;
    return serializable;
}

/**
 * Convert serializable state back to internal state
 * Adds back non-serializable properties with default values
 */
export function fromSerializableState<T = any>(
    serializableState: SerializedQueryState,
    originalState?: QueryStateInternal<T>
): QueryStateInternal<T> {
    return {
        ...(originalState ?? {}),
        ...serializableState,
        fromPersisterCache: !originalState, // Set flag if loading from persistence (no existing state)
    }
}

/**
 * Safely parses JSON with validation
 */
export function safeParseJSON(json: string): PersistedState | null {
    try {
        const parsed = JSON.parse(json);
        return validatePersistedState(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export const warnNoStorage = () => {
    console.warn('[Qortex] No storage found, persister will not be able to persist data');
}

export const warnPersisterAfterQueriesUsed = () => {
    console.warn('[Qortex] Persister is being set after queries have been used. This may cause data inconsistency. It is recommended to set the persister before any query usage.');
}