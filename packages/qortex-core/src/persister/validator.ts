import { QueryStatus } from '../queryManager/types';
import { SerializedQueryState, PersistedState } from './types';

/**
 * Validates if a value is a valid QueryStatus
 */
function isValidQueryStatus(value: any): value is QueryStatus {
    return typeof value === 'string' &&
        ['idle', 'fetching', 'success', 'error'].includes(value);
}

/**
 * Validates if a value is a valid equality strategy
 */
function isValidEqualityStrategy(value: any): value is 'shallow' | 'deep' {
    return typeof value === 'string' &&
        ['shallow', 'deep'].includes(value);
}

/**
 * Validates if a value is a valid refetch strategy
 */
function isValidRefetchStrategy(value: any): value is "always" | "stale" | false {
    return value === false ||
        (typeof value === 'string' && ['always', 'stale'].includes(value));
}

/**
 * Validates SerializedQueryState structure
 */
export function validateSerializableQueryState(data: any): data is SerializedQueryState {
    if (!data || typeof data !== 'object') {
        return false;
    }

    // Required fields
    if (!isValidQueryStatus(data.status)) {
        return false;
    }

    if (typeof data.staleTime !== 'number' || data.staleTime < 0) {
        return false;
    }

    if (typeof data.isInvalidated !== 'boolean') {
        return false;
    }

    if (!isValidEqualityStrategy(data.equalityStrategy)) {
        return false;
    }

    if (!isValidRefetchStrategy(data.refetchOnSubscribe)) {
        return false;
    }


    return true;
}


/**
 * Validates PersistedState structure
 */
export function validatePersistedState(data: any): data is PersistedState {
    if (!data || typeof data !== 'object') {
        return false;
    }

    if (!data.entries || typeof data.entries !== 'object') {
        return false;
    }

    // Validate all entries
    for (const [key, entry] of Object.entries(data.entries)) {
        if (typeof key !== 'string') {
            return false;
        }
        if (!validateSerializableQueryState(entry)) {
            return false;
        }
    }

    if (typeof data.burstKey !== 'string') {
        return false;
    }


    if (typeof data.timestamp !== 'number' || data.timestamp < 0) {
        return false;
    }

    return true;
}


