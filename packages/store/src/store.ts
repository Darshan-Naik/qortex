import type { Listener, StateCreator, Store, CreateStoreOptions } from "./types";

/**
 * Create a new store instance.
 *
 * @template T - The state type
 * @param initializer - A `StateCreator` function that receives `set` and `get`
 *                       and returns the initial state (can include action methods).
 * @param options - Optional configuration, e.g. attach a persister for automatic
 *                  hydration and persistence.
 * @returns A `Store<T>` instance with `get`, `set`, `subscribe`, and `destroy`.
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
 * @example
 * // With persistence (auto-hydrates and auto-persists via qortex-db)
 * const db = createDB({ name: "myapp", driver: "indexedDB" });
 * const settingsStore = createStore(
 *   (set) => ({ theme: "light", locale: "en" }),
 *   { persister: createStorePersister(db, { storageKey: "settings" }) }
 * );
 */
export const createStore = <T>(
    initializer: T | StateCreator<T>,
    options?: CreateStoreOptions<T>
): Store<T> => {
    let listeners = new Set<Listener<T>>();

    const get: Store<T>["get"] = () => state;

    const set: Store<T>["set"] = (partial, replace) => {
        const next = typeof partial === "function" ? (partial as any)(state) : partial;
        const nextState = replace
            ? (next as T)
            : (typeof next === "object" && next !== null ? { ...state, ...next } : next as T);

        if (!Object.is(state, nextState)) {
            const prevState = state;
            state = nextState;
            listeners.forEach((listener) => listener(state, prevState));
            options?.persister?.persist(state);
        }
    };

    let state: T = typeof initializer === "function" ? (initializer as StateCreator<T>)(set, get) : initializer;

    if (options?.persister) {
        options.persister.hydrate().then((stored) => {
            if (stored != null) set(stored);
        }).catch((err) => {
            console.warn("[Qortex Store] Failed to hydrate:", err);
        });
    }

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
