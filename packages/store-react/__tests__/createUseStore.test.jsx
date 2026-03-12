import React from "react";
import { render, screen, act } from "@testing-library/react";
import { createStore } from "qortex-store";
import { createUseStore } from "../src/createUseStore";

describe("createUseStore", () => {
    let counterStore;
    let useCounter;

    beforeEach(() => {
        counterStore = createStore((set, get) => ({
            count: 0,
            name: "test",
            increment: () => set({ count: get().count + 1 }),
        }));
        useCounter = createUseStore(counterStore);
    });

    afterEach(() => {
        counterStore.destroy();
    });

    it("creates a hook that retrieves full state by default", () => {
        function Display() {
            const state = useCounter();
            return <span data-testid="count">{state.count}</span>;
        }

        render(<Display />);
        expect(screen.getByTestId("count").textContent).toBe("0");
    });

    it("creates a hook that uses selectors", () => {
        function CountDisplay() {
            const count = useCounter((s) => s.count);
            return <span data-testid="count">{count}</span>;
        }

        render(<CountDisplay />);
        expect(screen.getByTestId("count").textContent).toBe("0");

        act(() => {
            counterStore.get().increment();
        });

        expect(screen.getByTestId("count").textContent).toBe("1");
    });

    it("creates a hook that respects custom equalityFn", () => {
        const renderCount = jest.fn();

        function NameDisplay() {
            const name = useCounter(
                (s) => s.name,
                (a, b) => a === b,
            );
            renderCount();
            return <span data-testid="name">{name}</span>;
        }

        render(<NameDisplay />);
        expect(renderCount).toHaveBeenCalledTimes(1);

        // Change count (name stays the same) -> should NOT re-render if equalityFn works
        act(() => {
            counterStore.get().increment();
        });

        expect(renderCount).toHaveBeenCalledTimes(1);
    });
});
