/**
 * React bindings for qortex-form.
 *
 * Wrap with `FormProvider` so `useField` / `useFieldArray` can read context.
 *
 * Optional binders (separate entry points — install peer deps as needed):
 * - `qortex-form-react/query` — `useQueryForm`, `useFormMutation`
 * - `qortex-form-react/store` — `useFormStore`
 */

export { FormProvider, useFormContext } from "./FormProvider";
export { useForm } from "./useForm";
export { useField } from "./useField";
export { useFieldArray } from "./useFieldArray";
export { bindFormActions, serializeKey } from "./bindFormActions";
