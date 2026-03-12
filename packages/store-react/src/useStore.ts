import { useSyncExternalStore, useRef, useCallback } from "react";
import type { Store } from "qortex-store";

/**
 * React hook to read (and subscribe to) state from a qortex-store.
 *
 * @template T - The full state type of the store
 * @template U - The selected slice type (defaults to `T`)
 *
 * @param store - A store created with `createStore`
 * @param selector - A function that picks the slice of state you need
 * @param equalityFn - Custom equality check to avoid re-renders
 * @returns The selected state slice, kept in sync with the store
 */
export function useStore<T, U = T>(
    store: Store<T>,
    selector: (state: T) => U = (state) => state as unknown as U,
    equalityFn: (a: U, b: U) => boolean = Object.is,
): U {
    const internalRef = useRef<{ state: T; value: U }>();

    const getSelection = useCallback(() => {
        const state = store.get();
        const prev = internalRef.current;

        if (prev && Object.is(prev.state, state)) {
            return prev.value;
        }

        const value = selector(state);
        if (prev && equalityFn(prev.value, value)) {
            prev.state = state;
            return prev.value;
        }

        internalRef.current = { state, value };
        return value;
    }, [store, selector, equalityFn]);

    return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}
