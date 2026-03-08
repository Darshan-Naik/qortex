import React from "react";
import { render, screen, act } from "@testing-library/react";
import { createStore } from "qortex-store";
import { useStore } from "../src/useStore";

describe("useStore", () => {
    let counterStore;

    beforeEach(() => {
        counterStore = createStore((set, get) => ({
            count: 0,
            name: "test",
            increment: () => set({ count: get().count + 1 }),
            setName: (name) => set({ name }),
        }));
    });

    afterEach(() => {
        counterStore.destroy();
    });

    // ── Basic rendering ────────────────────────────────────────────────

    it("renders the current store state", () => {
        function Display() {
            const state = useStore(counterStore);
            return <span data-testid="count">{state.count}</span>;
        }

        render(<Display />);
        expect(screen.getByTestId("count").textContent).toBe("0");
    });

    // ── Re-renders on change ───────────────────────────────────────────

    it("re-renders when state changes", () => {
        function Display() {
            const state = useStore(counterStore);
            return <span data-testid="count">{state.count}</span>;
        }

        render(<Display />);
        expect(screen.getByTestId("count").textContent).toBe("0");

        act(() => {
            counterStore.getState().increment();
        });

        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    // ── Selector ───────────────────────────────────────────────────────

    it("only returns the selected slice", () => {
        function CountDisplay() {
            const count = useStore(counterStore, (s) => s.count);
            return <span data-testid="count">{count}</span>;
        }

        render(<CountDisplay />);
        expect(screen.getByTestId("count").textContent).toBe("0");

        act(() => {
            counterStore.getState().increment();
        });

        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    // ── equalityFn prevents unnecessary re-renders ─────────────────────

    it("skips re-render when equalityFn returns true", () => {
        const renderCount = jest.fn();

        function NameDisplay() {
            const name = useStore(
                counterStore,
                (s) => s.name,
                (a, b) => a === b,
            );
            renderCount();
            return <span data-testid="name">{name}</span>;
        }

        render(<NameDisplay />);
        expect(renderCount).toHaveBeenCalledTimes(1);

        // Change count (name stays the same) → should NOT re-render
        act(() => {
            counterStore.getState().increment();
        });

        // useSyncExternalStoreWithSelector + Object.is on name means no extra render
        expect(renderCount).toHaveBeenCalledTimes(1);
    });

    // ── Unsubscribes on unmount ────────────────────────────────────────

    it("unsubscribes when component unmounts", () => {
        function Display() {
            const state = useStore(counterStore);
            return <span>{state.count}</span>;
        }

        const { unmount } = render(<Display />);
        unmount();

        // This should not throw or cause issues
        act(() => {
            counterStore.setState({ count: 999 });
        });
    });

    // ── Multiple selectors on same store ───────────────────────────────

    it("supports multiple components selecting different slices", () => {
        function CountDisplay() {
            const count = useStore(counterStore, (s) => s.count);
            return <span data-testid="count">{count}</span>;
        }

        function NameDisplay() {
            const name = useStore(counterStore, (s) => s.name);
            return <span data-testid="name">{name}</span>;
        }

        render(
            <>
                <CountDisplay />
                <NameDisplay />
            </>,
        );

        expect(screen.getByTestId("count").textContent).toBe("0");
        expect(screen.getByTestId("name").textContent).toBe("test");

        act(() => {
            counterStore.getState().increment();
        });

        expect(screen.getByTestId("count").textContent).toBe("1");
        expect(screen.getByTestId("name").textContent).toBe("test");
    });
});
