/**
 * Listener callback invoked when state changes.
 *
 * @template T - The state type
 * @param state - The new state after the change
 * @param prevState - The state before the change
 *
 * @example
 * const listener: Listener<{ count: number }> = (state, prevState) => {
 *   console.log(`Count changed from ${prevState.count} to ${state.count}`);
 * };
 */
export type Listener<T> = (state: T, prevState: T) => void;

/**
 * A store instance returned by `createStore`.
 * Provides methods to read, update, and subscribe to state.
 *
 * @template T - The state type
 */
export type Store<T> = {
    /**
     * Get the current state snapshot.
     *
     * @returns The current state
     *
     * @example
     * const state = store.get();
     * console.log(state.count);
     */
    get: () => T;

    /**
     * Update the state.
     *
     * Accepts a partial state object, a complete replacement, or an updater function.
     * By default, partial updates are shallow-merged into the current state.
     * Pass `replace: true` to replace the entire state.
     *
     * @param partial - New partial state, full state, or updater function
     * @param replace - If true, replaces state entirely instead of merging
     *
     * @example
     * // Partial merge
     * store.set({ count: 1 });
     *
     * @example
     * // Updater function
     * store.set((state) => ({ count: state.count + 1 }));
     *
     * @example
     * // Full replacement
     * store.set({ count: 0, name: "reset" }, true);
     */
    set: (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean,
    ) => void;

    /**
     * Subscribe to state changes.
     *
     * The listener is called after every `set` that produces a new state reference.
     *
     * @param listener - Callback invoked with `(newState, prevState)`
     * @returns An unsubscribe function
     *
     * @example
     * const unsub = store.subscribe((state, prev) => {
     *   if (state.count !== prev.count) console.log("count changed!");
     * });
     * // later…
     * unsub();
     */
    subscribe: (listener: Listener<T>) => () => void;

    /**
     * Destroy the store: remove all listeners and reset to initial state.
     *
     * @example
     * store.destroy();
     */
    destroy: () => void;
};

/**
 * State creator / initializer function passed to `createStore`.
 *
 * Receives `set` and `get` so the initial state can include actions
 * that reference store methods.
 *
 * @template T - The state type
 * @param set - Alias for `store.set`
 * @param get - Alias for `store.get`
 *
 * @example
 * const creator: StateCreator<CounterState> = (set, get) => ({
 *   count: 0,
 *   increment: () => set({ count: get().count + 1 }),
 * });
 */
export type StateCreator<T> = (
    set: Store<T>["set"],
    get: Store<T>["get"],
) => T;

/**
 * Persister interface for `createStore`.
 *
 * Implement this (or use `createStorePersister` from `qortex-db`) to add
 * transparent persistence to any store. The store calls `hydrate()` once on
 * creation and `persist()` after every state change.
 *
 * @template T - The state type
 */
export interface StorePersister<T> {
    /**
     * Load the last saved snapshot from storage.
     * Return `undefined` or `null` to keep the store's initial state.
     */
    hydrate(): Promise<T | null | undefined>;

    /**
     * Persist a new state snapshot to storage.
     * Called after every `set` that produces a new state.
     * Implementations should debounce this internally.
     */
    persist(state: T): void;
}

/**
 * Options passed as the second argument to `createStore`.
 *
 * @template T - The state type
 */
export type CreateStoreOptions<T> = {
    /**
     * Attach a persister to automatically hydrate the store on creation
     * and persist its state on every change.
     *
     * @example
     * ```ts
     * import { createDB, createStorePersister } from "qortex-db";
     *
     * const db = createDB({ name: "myapp", driver: "indexedDB" });
     * const store = createStore(
     *   (set) => ({ count: 0 }),
     *   { persister: createStorePersister(db, { storageKey: "counter" }) }
     * );
     * ```
     */
    persister?: StorePersister<T>;
};
