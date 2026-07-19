import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createStore } from "qortex-store";
import { useFormStore } from "../src/store";
import { FormProvider, useField } from "../src/index";

describe("useFormStore", () => {
    it("syncs form data from store and updates when store changes", () => {
        const store = createStore(() => ({
            profile: { name: "Alice" },
        }));

        const Shell = () => {
            const { form, draft, isChanged, set } = useFormStore({
                key: "profile",
                store,
                selector: (s) => s.profile,
            });

            return (
                <FormProvider form={form}>
                    <span data-testid="name">{draft?.name}</span>
                    <span data-testid="changed">{isChanged ? "true" : "false"}</span>
                    <NameInput />
                    <button data-testid="dirty" onClick={() => set("name", "local")}>
                        Dirty
                    </button>
                </FormProvider>
            );
        };

        const NameInput = () => {
            const { value } = useField("name");
            return <span data-testid="field">{(value as string) ?? ""}</span>;
        };

        render(<Shell />);

        expect(screen.getByTestId("name").textContent).toBe("Alice");
        expect(screen.getByTestId("field").textContent).toBe("Alice");

        act(() => {
            fireEvent.click(screen.getByTestId("dirty"));
        });
        expect(screen.getByTestId("changed").textContent).toBe("true");
        expect(screen.getByTestId("name").textContent).toBe("local");

        act(() => {
            store.set({ profile: { name: "Bob" } });
        });

        // keepDirty by default — local override on name may remain if it differs
        expect(screen.getByTestId("field").textContent).toBe("local");
    });
});
