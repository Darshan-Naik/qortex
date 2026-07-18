import type { ValidationResolver } from "./types";

/**
 * Minimal Zod-compatible schema surface (avoids a hard Zod dependency).
 */
export interface ZodLikeSchema {
    safeParse(data: unknown):
        | { success: true }
        | {
              success: false;
              error: {
                  issues: Array<{ path: Array<string | number>; message: string }>;
              };
          };
}

/**
 * Build a `validate.resolver` from a Zod (or Zod-compatible) schema.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { createResource, zodResolver } from "qortex-resource";
 *
 * const schema = z.object({ name: z.string().min(1) });
 *
 * createResource({
 *   initialData: { name: "" },
 *   validate: { resolver: zodResolver(schema) },
 * });
 * ```
 */
export function zodResolver<T = any>(schema: ZodLikeSchema): ValidationResolver<T> {
    return (data) => {
        const result = schema.safeParse(data);
        if (result.success) return null;

        const errors: Record<string, string | undefined> = {};
        for (const issue of result.error.issues) {
            const path = issue.path.join(".");
            if (path && errors[path] === undefined) {
                errors[path] = issue.message;
            }
        }
        return errors;
    };
}
