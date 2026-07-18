import type { Plugin, PluginContext } from "../types";
import { getByPath } from "../path";

/**
 * Strategy for when validation should occur.
 */
export type ValidationStrategy = "change" | "blur" | "submit";

/**
 * Options for the validation plugin.
 *
 * Supports two modes of validation:
 * 1. Resolver function (schema-based, e.g., Zod, Valibot)
 * 2. Field-level validator functions
 */
export interface ValidatePluginOptions<T> {
    /**
     * Optional schema resolver.
     * Receives the full data object and returns a flat record of path -> error string.
     * Return an empty object or null if valid.
     */
    resolver?: (data: T) => Record<string, string | undefined> | null;

    /**
     * Optional field-level validators.
     * Record of path pattern -> validation function.
     * The path pattern supports wildcards (e.g., 'contacts.*.email').
     */
    fields?: Record<
        string,
        (value: any, data: T) => string | undefined | null
    >;

    /**
     * When validation should trigger. Default: 'blur'
     */
    validateOn?: ValidationStrategy;
}

/**
 * Validation plugin — provides schema and field-level validation logic.
 *
 * Plugs into field changes, blurs, and before-mutate hooks to run
 * validations and update the field metadata with errors.
 *
 * @param options - Validation configuration
 * @returns A Plugin instance
 *
 * @example
 * ```ts
 * import { validatePlugin } from 'qortex-resource/validate';
 * import { z } from 'zod';
 *
 * const userSchema = z.object({ name: z.string().min(2) });
 *
 * createResource({
 *   plugins: [
 *     validatePlugin({
 *       resolver: (data) => {
 *          const result = userSchema.safeParse(data);
 *          if (result.success) return {};
 *          // ... flatten zod errors to Record<string, string>
 *       },
 *       validateOn: 'blur',
 *     }),
 *   ],
 * });
 * ```
 */
export function validatePlugin<T = any>(
    options: ValidatePluginOptions<T>,
): Plugin<T> {
    const { resolver, fields, validateOn = "blur" } = options;
    const lastErrorPaths = new Set<string>();

    /**
     * Match a given concrete path against a pattern that might contain wildcards.
     * E.g., matchPath('contacts.0.email', 'contacts.*.email') -> true
     */
    function matchPath(path: string, pattern: string): boolean {
        if (pattern === path) return true;
        if (!pattern.includes("*")) return false;

        const pathSegments = path.split(".");
        const patternSegments = pattern.split(".");

        if (pathSegments.length !== patternSegments.length) return false;

        for (let i = 0; i < patternSegments.length; i++) {
            if (
                patternSegments[i] !== "*" &&
                patternSegments[i] !== pathSegments[i]
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Run all applicable validations for a specific field path.
     */
    function runFieldValidation(path: string, ctx: PluginContext<T>): boolean {
        if (!fields) return true;

        const data = ctx.getUpdatedData();
        const value = getByPath(data, path);

        let errorStr: string | undefined = undefined;

        for (const [pattern, validator] of Object.entries(fields)) {
            if (matchPath(path, pattern)) {
                const err = validator(value, data);
                if (err) {
                    errorStr = err;
                    break; // Stop at first error for this field
                }
            }
        }

        ctx.setFieldError(path, errorStr);
        if (errorStr) {
            lastErrorPaths.add(path);
        } else {
            lastErrorPaths.delete(path);
        }
        return !errorStr;
    }

    /**
     * Run full schema validation and update all errors.
     */
    function runFullValidation(ctx: PluginContext<T>): boolean {
        const newErrors: Record<string, string | undefined> = {};
        const data = ctx.getUpdatedData();

        if (resolver) {
            const errors = resolver(data);
            if (errors) {
                Object.assign(newErrors, errors);
            }
        }

        if (fields) {
            for (const [pattern, validator] of Object.entries(fields)) {
                for (const path of resolvePatternPaths(data, pattern)) {
                    const err = validator(getByPath(data, path), data);
                    if (err) {
                        newErrors[path] = err;
                    } else if (!(path in newErrors)) {
                        newErrors[path] = undefined;
                    }
                }
            }
        }

        for (const path of lastErrorPaths) {
            if (!(path in newErrors)) {
                newErrors[path] = undefined;
            }
        }

        lastErrorPaths.clear();
        let isValid = true;
        for (const [path, error] of Object.entries(newErrors)) {
            if (error) {
                isValid = false;
                lastErrorPaths.add(path);
            }
        }

        ctx.setFieldErrors(newErrors);
        return isValid;
    }

    return {
        name: "validate",

        onFieldChange(path: string, _value: any, ctx: PluginContext<T>) {
            if (validateOn === "change") {
                if (resolver) {
                    // Running full schema on every keystroke can be heavy, but it's what 'change' implies
                    runFullValidation(ctx);
                } else {
                    runFieldValidation(path, ctx);
                }
            } else if (validateOn === "blur") {
                // If it was already in error state, re-validate to clear it early
                const meta = ctx.getFieldMeta(path);
                if (meta.error) {
                    runFieldValidation(path, ctx);
                }
            }
        },

        onFieldBlur(path: string, ctx: PluginContext<T>) {
            if (validateOn === "blur" || validateOn === "change") {
                if (resolver) {
                    runFullValidation(ctx);
                } else {
                    runFieldValidation(path, ctx);
                }
            }
        },

        async onBeforeMutate(_data: T, ctx: PluginContext<T>) {
            return runFullValidation(ctx);
        },
    };
}

function resolvePatternPaths(data: any, pattern: string): string[] {
    if (!pattern.includes("*")) return [pattern];

    const results: string[] = [];
    const segments = pattern.split(".");

    function walk(current: any, index: number, path: string[]): void {
        if (index === segments.length) {
            results.push(path.join("."));
            return;
        }

        const segment = segments[index];
        if (segment === "*") {
            if (current == null || typeof current !== "object") return;
            for (const key of Object.keys(current)) {
                walk(current[key], index + 1, [...path, key]);
            }
            return;
        }

        walk(current?.[segment], index + 1, [...path, segment]);
    }

    walk(data, 0, []);
    return results;
}
