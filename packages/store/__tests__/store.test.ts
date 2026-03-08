import { createStore } from "../src/store";

// ── Helper types ──────────────────────────────────────────────────────
type Counter = { count: number };
type AB = { a: number; b: number };
type WithActions = {
    items: string[];
    addItem: (item: string) => void;
    clear: () => void;
};
type CounterWithActions = {
    count: number;
    increment: () => void;
};

describe("createStore", () => {
    // ── Creation ──────────────────────────────────────────────────────────

    it("returns initial state from the initializer", () => {
        const store = createStore<Counter>(() => ({ count: 0 }));
        expect(store.getState()).toEqual({ count: 0 });
    });

    it("provides set and get to the initializer", () => {
        const store = createStore<CounterWithActions>((set, get) => ({
            count: 0,
            increment: () => set({ count: get().count + 1 }),
        }));

        store.getState().increment();
        expect(store.getState().count).toBe(1);
    });

    it("supports passing a raw object as the initial state", () => {
        const store = createStore<Counter>({ count: 10 });
        expect(store.getState()).toEqual({ count: 10 });
    });

    // ── setState ──────────────────────────────────────────────────────────

    describe("setState", () => {
        it("shallow-merges a partial object", () => {
            const store = createStore<AB>(() => ({ a: 1, b: 2 }));
            store.setState({ a: 10 });
            expect(store.getState()).toEqual({ a: 10, b: 2 });
        });

        it("accepts an updater function", () => {
            const store = createStore<Counter>(() => ({ count: 5 }));
            store.setState((s) => ({ count: s.count * 2 }));
            expect(store.getState().count).toBe(10);
        });

        it("replaces state entirely when replace=true", () => {
            const store = createStore<AB>(() => ({ a: 1, b: 2 }));
            store.setState({ a: 99 } as AB, true);
            expect(store.getState()).toEqual({ a: 99 });
        });

        it("does not notify listeners if state reference is unchanged", () => {
            const store = createStore<{ x: number }>(() => ({ x: 1 }));
            const listener = jest.fn();
            store.subscribe(listener);

            const state = store.getState();
            store.setState(state, true); // same reference
            expect(listener).not.toHaveBeenCalled();
        });

        it("handles non-object state (number)", () => {
            const store = createStore<number>(() => 42);
            store.setState(100, true);
            expect(store.getState()).toBe(100);
        });
    });

    // ── subscribe ─────────────────────────────────────────────────────────

    describe("subscribe", () => {
        it("calls listener with (newState, prevState) on change", () => {
            const store = createStore<Counter>(() => ({ count: 0 }));
            const listener = jest.fn();
            store.subscribe(listener);

            store.setState({ count: 1 });

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
        });

        it("returns an unsubscribe function", () => {
            const store = createStore<{ v: number }>(() => ({ v: 0 }));
            const listener = jest.fn();
            const unsub = store.subscribe(listener);

            store.setState({ v: 1 });
            expect(listener).toHaveBeenCalledTimes(1);

            unsub();
            store.setState({ v: 2 });
            expect(listener).toHaveBeenCalledTimes(1); // no additional call
        });

        it("supports multiple listeners", () => {
            const store = createStore<{ n: number }>(() => ({ n: 0 }));
            const l1 = jest.fn();
            const l2 = jest.fn();

            store.subscribe(l1);
            store.subscribe(l2);

            store.setState({ n: 1 });

            expect(l1).toHaveBeenCalledTimes(1);
            expect(l2).toHaveBeenCalledTimes(1);
        });
    });

    // ── destroy ───────────────────────────────────────────────────────────

    describe("destroy", () => {
        it("removes all listeners and resets to initial state", () => {
            const store = createStore<Counter>(() => ({ count: 0 }));
            const listener = jest.fn();
            store.subscribe(listener);

            store.setState({ count: 5 });
            expect(listener).toHaveBeenCalledTimes(1);

            store.destroy();

            // State should be reset
            expect(store.getState()).toEqual({ count: 0 });

            // Listener should no longer fire
            store.setState({ count: 10 });
            expect(listener).toHaveBeenCalledTimes(1); // still 1
        });
    });

    // ── Actions pattern ───────────────────────────────────────────────────

    describe("actions pattern", () => {
        it("supports actions defined in the initializer", () => {
            const store = createStore<WithActions>((set) => ({
                items: [],
                addItem: (item: string) =>
                    set((s: WithActions) => ({ items: [...s.items, item] })),
                clear: () => set({ items: [] }),
            }));

            store.getState().addItem("a");
            store.getState().addItem("b");
            expect(store.getState().items).toEqual(["a", "b"]);

            store.getState().clear();
            expect(store.getState().items).toEqual([]);
        });
    });
});
