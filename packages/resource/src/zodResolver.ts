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
 * When called in field mode with a `path`, only errors under that path
 * (exact or descendant) are returned.
 */
export function zodResolver<T = any>(schema: ZodLikeSchema): ValidationResolver<T> {
    return (data, context) => {
        const result = schema.safeParse(data);
        if (result.success) return null;

        const errors: Record<string, string | undefined> = {};
        for (const issue of result.error.issues) {
            const path = issue.path.join(".");
            if (path && errors[path] === undefined) {
                errors[path] = issue.message;
            }
        }

        if (context.mode === "field" && context.path) {
            const target = context.path;
            const prefix = target + ".";
            return Object.fromEntries(
                Object.entries(errors).filter(
                    ([path]) => path === target || path.startsWith(prefix),
                ),
            );
        }

        return errors;
    };
}
