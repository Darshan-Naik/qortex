import type { Listener, StateCreator, Store } from "./types";

/**
 * Create a new store instance.
 *
 * @template T - The state type
 * @param initializer - A `StateCreator` function that receives `set` and `get`
 *                       and returns the initial state (can include action methods).
 * @returns A `Store<T>` instance with `get`, `set`, `subscribe`, and `destroy`.
 *
 * @throws {QortexStoreError} If `initializer` is not a function.
 *
 * @example
 * // Simple counter store
 * const counterStore = createStore((set, get) => ({
 *   count: 0,
 *   increment: () => set({ count: get().count + 1 }),
 *   decrement: () => set((state) => ({ count: state.count - 1 })),
 *   reset: () => set({ count: 0 }),
 * }));
 *
 * counterStore.get().count;       // 0
 * counterStore.get().increment();
 * counterStore.get().count;       // 1
 */
export const createStore = <T>(initializer: T | StateCreator<T>): Store<T> => {
    let listeners = new Set<Listener<T>>();

    const get: Store<T>["get"] = () => state;

    const set: Store<T>["set"] = (partial, replace) => {
        const next = typeof partial === "function" ? (partial as any)(state) : partial;
        const nextState = replace ? (next as T) : (typeof next === "object" && next !== null ? { ...state, ...next } : next as T);

        if (!Object.is(state, nextState)) {
            const prev = state;
            state = nextState;
            listeners.forEach((l) => l(state, prev));
        }
    };

    let state: T = typeof initializer === "function" ? (initializer as StateCreator<T>)(set, get) : initializer;
    let initialState: T = state;

    return {
        get,
        set,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        destroy: () => {
            listeners.clear();
            state = initialState;
        },
    };
};
