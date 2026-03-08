import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import type { Store } from "qortex-store";

/**
 * React hook to read (and subscribe to) state from a `qortex-store` store.
 *
 * Uses `useSyncExternalStoreWithSelector` under the hood for safe concurrent-mode
 * rendering and efficient selector-based re-renders.
 *
 * @template T - The full state type of the store
 * @template U - The selected slice type (defaults to `T`)
 *
 * @param store - A store created with `createStore`
 * @param selector - A function that picks the slice of state you need
 *                   (defaults to identity — returns the full state)
 * @param equalityFn - Custom equality check to avoid re-renders
 *                     (defaults to `Object.is`)
 * @returns The selected state slice, kept in sync with the store
 *
 * @example
 * // Full state
 * const state = useStore(counterStore);
 *
 * @example
 * // Selector
 * const count = useStore(counterStore, (s) => s.count);
 *
 * @example
 * // With shallow equality
 * import { shallow } from "some-shallow-equal";
 * const { a, b } = useStore(store, (s) => ({ a: s.a, b: s.b }), shallow);
 */
export function useStore<T, U = T>(
    store: Store<T>,
    selector: (state: T) => U = (s) => s as unknown as U,
    equalityFn: (a: U, b: U) => boolean = Object.is,
): U {
    return useSyncExternalStoreWithSelector(
        store.subscribe,
        store.get,
        store.get, // server snapshot — same as client for client-only stores
        selector,
        equalityFn,
    );
}
