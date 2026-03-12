import type { Store } from "qortex-store";
import { useStore } from "./useStore";

/**
 * Creates a specialized hook for a specific store instance.
 *
 * This allows you to avoid passing the store repeatedly to `useStore`.
 *
 * @template T - The full state type of the store
 * @param store - The store instance to bind to the hook
 * @returns A hook that accepts a selector and equality function
 *
 * @example
 * const counterStore = createStore({ count: 0 });
 * const useCounter = createUseStore(counterStore);
 *
 * function Display() {
 *   const count = useCounter(s => s.count);
 *   return <div>{count}</div>;
 * }
 */
export function createUseStore<T>(store: Store<T>) {
    return <U = T>(
        selector: (state: T) => U = (s) => s as unknown as U,
        equalityFn: (a: U, b: U) => boolean = Object.is,
    ): U => useStore(store, selector, equalityFn);
}
