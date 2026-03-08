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
     * const state = store.getState();
     * console.log(state.count);
     */
    getState: () => T;

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
     * store.setState({ count: 1 });
     *
     * @example
     * // Updater function
     * store.setState((state) => ({ count: state.count + 1 }));
     *
     * @example
     * // Full replacement
     * store.setState({ count: 0, name: "reset" }, true);
     */
    setState: (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean,
    ) => void;

    /**
     * Subscribe to state changes.
     *
     * The listener is called after every `setState` that produces a new state reference.
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
 * @param set - Alias for `store.setState`
 * @param get - Alias for `store.getState`
 *
 * @example
 * const creator: StateCreator<CounterState> = (set, get) => ({
 *   count: 0,
 *   increment: () => set({ count: get().count + 1 }),
 * });
 */
export type StateCreator<T> = (
    set: Store<T>["setState"],
    get: Store<T>["getState"],
) => T;
