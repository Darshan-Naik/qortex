/**
 * Path-resolution helpers for form validation (wildcards + request filtering).
 */

/**
 * Expand a validation request into concrete paths.
 * - `"*"` → all paths matched by configured field validators
 * - patterns with `*` → {@link resolvePatternPaths}
 * - otherwise → `[request]`
 */
export function resolveRequestedPaths(
    data: any,
    request: string,
    validators?: Record<string, any>,
): string[] {
    if (request === "*") {
        const patterns = Object.keys((validators ?? {}) as Record<string, unknown>);
        return patterns.length === 0
            ? []
            : patterns.flatMap((pattern) => resolvePatternPaths(data, pattern));
    }
    if (request.includes("*")) return resolvePatternPaths(data, request);
    return [request];
}

/**
 * Keep only errors for the requested paths (no-op when request is `"*"`).
 */
export function filterErrors(
    errors: Record<string, string | undefined>,
    requestedPaths: string[],
    request: string[] | string,
): Record<string, string | undefined> {
    if (request === "*") return errors;
    const requested = new Set(requestedPaths);
    return Object.fromEntries(Object.entries(errors).filter(([path]) => requested.has(path)));
}

/** Whether `path` is included in the current validation request. */
export function matchesRequested(
    path: string,
    requestedPaths: string[],
    request: string[] | string,
): boolean {
    return request === "*" || requestedPaths.includes(path);
}

/**
 * Expand a wildcard path pattern against live data.
 *
 * @example
 * resolvePatternPaths({ contacts: [{ email: "a" }] }, "contacts.*.email")
 * // → ["contacts.0.email"]
 */
export function resolvePatternPaths(data: any, pattern: string): string[] {
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
