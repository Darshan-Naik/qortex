/**
 * Query binders for qortex-form-react.
 *
 * Requires peer dependencies: `qortex-query` and `qortex-query-react`.
 *
 * ```bash
 * npm i qortex-query-react
 * ```
 *
 * ```ts
 * import { useQueryForm } from "qortex-form-react/query";
 * ```
 */

export { useFormQuery } from "./useFormQuery";
export { useFormMutation } from "./useFormMutation";
export type {
    UseFormMutationOptions,
    UseFormMutationResult,
} from "./useFormMutation";
export { useQueryForm } from "./useQueryForm";
export type {
    UseQueryFormConfig,
    UseQueryFormResult,
} from "./useQueryForm";
