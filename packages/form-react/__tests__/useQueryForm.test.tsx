import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { dangerClearCache } from "qortex-query";
import { useQueryForm } from "../src/query";
import { useField } from "../src/index";

beforeEach(() => {
    dangerClearCache();
});

describe("useQueryForm", () => {
    it("loads via fetcher, edits draft, saves via mutationFn, resets draft", async () => {
        const fetcher = jest.fn(async () => ({ name: "Alice", email: "a@x.com" }));
        const mutationFn = jest.fn(async (draft: { name: string; email: string }) => {
            await new Promise((r) => setTimeout(r, 10));
            return { ...draft, saved: true };
        });

        const Shell = () => {
            const { Provider, isLoading, isSaving, isChanged, save, draft, error } =
                useQueryForm({
                    key: ["user", "1"],
                    fetcher,
                    mutationFn,
                });

            if (isLoading) return <div data-testid="loading">loading</div>;

            return (
                <Provider>
                    <span data-testid="name">{draft?.name}</span>
                    <span data-testid="changed">{isChanged ? "true" : "false"}</span>
                    <span data-testid="saving">{isSaving ? "true" : "false"}</span>
                    <span data-testid="error">{error ? String(error) : ""}</span>
                    <NameInput />
                    <button data-testid="save" onClick={() => save()}>
                        Save
                    </button>
                </Provider>
            );
        };

        const NameInput = () => {
            const { value, onChange } = useField("name");
            return (
                <input
                    data-testid="input"
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        };

        render(<Shell />);

        expect(screen.getByTestId("loading")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("name").textContent).toBe("Alice");
        });
        expect(fetcher).toHaveBeenCalled();

        act(() => {
            fireEvent.change(screen.getByTestId("input"), { target: { value: "Ada" } });
        });

        expect(screen.getByTestId("name").textContent).toBe("Ada");
        expect(screen.getByTestId("changed").textContent).toBe("true");

        await act(async () => {
            fireEvent.click(screen.getByTestId("save"));
        });

        await waitFor(() => {
            expect(mutationFn).toHaveBeenCalledWith(
                { name: "Ada", email: "a@x.com" },
                expect.objectContaining({ isChanged: true }),
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId("changed").textContent).toBe("false");
        });
    });

    it("supports create-only without fetcher", async () => {
        const mutationFn = jest.fn(async (draft: { name: string }) => draft);

        const Shell = () => {
            const { Provider, isLoading, isChanged, save, draft } = useQueryForm({
                key: ["user", "new"],
                initialData: { name: "" },
                mutationFn,
            });

            return (
                <Provider>
                    <span data-testid="loading">{isLoading ? "true" : "false"}</span>
                    <span data-testid="name">{draft?.name}</span>
                    <span data-testid="changed">{isChanged ? "true" : "false"}</span>
                    <NameInput />
                    <button data-testid="save" onClick={() => save()}>
                        Save
                    </button>
                </Provider>
            );
        };

        const NameInput = () => {
            const { value, onChange } = useField("name");
            return (
                <input
                    data-testid="input"
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        };

        render(<Shell />);

        expect(screen.getByTestId("loading").textContent).toBe("false");
        expect(screen.getByTestId("name").textContent).toBe("");

        act(() => {
            fireEvent.change(screen.getByTestId("input"), { target: { value: "New" } });
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId("save"));
        });

        await waitFor(() => {
            expect(mutationFn).toHaveBeenCalledWith(
                { name: "New" },
                expect.any(Object),
            );
        });
    });
});
