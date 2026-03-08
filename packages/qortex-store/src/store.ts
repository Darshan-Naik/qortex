import type { Listener, StateCreator, Store } from "./types";
import { QortexStoreError } from "./errors";

/**
 * Create a new store instance.
 *
 * @template T - The state type
 * @param initializer - A `StateCreator` function that receives `set` and `get`
 *                       and returns the initial state (can include action methods).
 * @returns A `Store<T>` instance with `getState`, `setState`, `subscribe`, and `destroy`.
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
 * counterStore.getState().count;       // 0
 * counterStore.getState().increment();
 * counterStore.getState().count;       // 1
 */
export const createStore = <T>(initializer: T | StateCreator<T>): Store<T> => {
    let listeners = new Set<Listener<T>>();
    let state: T;
    let initialState: T;

    // ── Internal helpers ────────────────────────────────────────────────

    const getState: Store<T>["getState"] = () => state;

    const setState: Store<T>["setState"] = (partial, replace) => {
        const prevState = state;

        // Resolve next state
        const nextPartial =
            typeof partial === "function"
                ? (partial as (s: T) => T | Partial<T>)(state)
                : partial;

        // Replace entirely or shallow-merge
        if (replace) {
            state = nextPartial as T;
        } else {
            state =
                typeof nextPartial === "object" && nextPartial !== null
                    ? { ...state, ...(nextPartial as Partial<T>) }
                    : (nextPartial as T);
        }

        // Only notify if state reference changed
        if (!Object.is(state, prevState)) {
            listeners.forEach((listener) => listener(state, prevState));
        }
    };

    const subscribe: Store<T>["subscribe"] = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    const destroy: Store<T>["destroy"] = () => {
        listeners.clear();
        state = initialState;
    };

    // ── Initialise state ────────────────────────────────────────────────

    if (typeof initializer === "function") {
        state = (initializer as StateCreator<T>)(setState, getState);
    } else {
        state = initializer;
    }
    initialState = state;

    return { getState, setState, subscribe, destroy };
};
