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
 * import { useFormQuery } from "qortex-form-react/query";
 * ```
 */

export { useFormMutation } from "./useFormMutation";
export type {
    UseFormMutationOptions,
    UseFormMutationResult,
} from "./useFormMutation";
export { useFormQuery } from "./useFormQuery";
export type {
    UseFormQueryConfig,
    UseFormQueryResult,
} from "./useFormQuery";
