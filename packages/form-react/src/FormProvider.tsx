import { createContext, useContext, type ReactNode } from "react";
import type { Form } from "qortex-form";

const FormContext = createContext<Form<any> | null>(null);

/**
 * Provide a form instance to `useField` / `useFieldArray` / `useFormContext`.
 */
export function FormProvider<T>({
    form,
    children,
}: {
    form: Form<T>;
    children: ReactNode;
}) {
    return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

/**
 * Read the form from the nearest {@link FormProvider}.
 * @throws if no provider is present
 */
export function useFormContext<T = any>(): Form<T> {
    const form = useContext(FormContext);
    if (!form) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return form as Form<T>;
}
