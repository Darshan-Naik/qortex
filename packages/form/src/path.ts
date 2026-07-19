/**
 * Deep path utilities for immutable get/set/delete operations on nested objects.
 *
 * These power the form engine's field tracking and draft overrides.
 * All mutation operations return new objects (immutable updates).
 */

/**
 * Split a dot-notation path into segments.
 * Handles numeric indices for arrays.
 *
 * @example
 * parsePath('address.city')        → ['address', 'city']
 * parsePath('contacts.0.email')    → ['contacts', '0', 'email']
 */
export function parsePath(path: string | string[]): string[] {
    if (Array.isArray(path)) return path;
    if (typeof path !== "string") return [];
    return path.split(".");
}

/**
 * Get a value from a nested object by dot-notation path.
 *
 * @param obj - The object to read from
 * @param path - Dot-notation path (e.g., 'address.city')
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * getByPath({ address: { city: 'Mumbai' } }, 'address.city') → 'Mumbai'
 * getByPath({ contacts: [{ email: 'a@b' }] }, 'contacts.0.email') → 'a@b'
 */
export function getByPath(obj: any, path: string): any {
    const keys = parsePath(path);
    let current = obj;

    for (const key of keys) {
        if (current == null) return undefined;
        current = current[key];
    }

    return current;
}

/**
 * Set a value in a nested object by dot-notation path.
 * Returns a new object with the value updated (immutable).
 *
 * Creates intermediate objects/arrays as needed.
 *
 * @param obj - The source object
 * @param path - Dot-notation path
 * @param value - The value to set
 * @returns A new object with the value set at the path
 *
 * @example
 * setByPath({ address: { city: 'Delhi' } }, 'address.city', 'Mumbai')
 * // → { address: { city: 'Mumbai' } }
 */
export function setByPath<T>(obj: T, path: string, value: any): T {
    const keys = parsePath(path);

    if (keys.length === 0) return value as T;

    // Clone the root
    const result = Array.isArray(obj)
        ? ([...obj] as any)
        : { ...(obj as any) };

    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        const isNextArrayIndex = /^\d+$/.test(nextKey);

        if (current[key] == null) {
            // Create intermediate container
            current[key] = isNextArrayIndex ? [] : {};
        } else {
            // Clone intermediate container (immutable)
            current[key] = Array.isArray(current[key])
                ? [...current[key]]
                : { ...current[key] };
        }

        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return result as T;
}

/**
 * Delete a value from a nested object by dot-notation path.
 * Returns a new object with the value removed (immutable).
 *
 * For arrays, uses splice to remove the item (shifts indices).
 * For objects, uses delete.
 *
 * @param obj - The source object
 * @param path - Dot-notation path to delete
 * @returns A new object with the value removed
 */
export function deleteByPath<T>(obj: T, path: string): T {
    const keys = parsePath(path);

    if (keys.length === 0) return undefined as any;

    const result = Array.isArray(obj)
        ? ([...obj] as any)
        : { ...(obj as any) };

    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] == null) return obj; // path doesn't exist, no-op

        current[key] = Array.isArray(current[key])
            ? [...current[key]]
            : { ...current[key] };
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];

    if (Array.isArray(current) && /^\d+$/.test(lastKey)) {
        current.splice(Number(lastKey), 1);
    } else {
        delete current[lastKey];
    }

    return result as T;
}

/**
 * Check if a path exists in an object.
 *
 * @param obj - The object to check
 * @param path - Dot-notation path
 * @returns Whether the path exists (value at path is not undefined)
 */
export function hasPath(obj: any, path: string): boolean {
    return getByPath(obj, path) !== undefined;
}

/**
 * Compute the list of paths that differ between two objects.
 * Performs a recursive deep comparison and collects divergent leaf paths.
 *
 * @param a - First object
 * @param b - Second object
 * @param prefix - Internal prefix for recursion
 * @returns Array of dot-notation paths that differ
 *
 * @example
 * diffPaths(
 *   { name: 'A', address: { city: 'Delhi', zip: '110001' } },
 *   { name: 'B', address: { city: 'Delhi', zip: '110002' } }
 * )
 * // → ['name', 'address.zip']
 */
export function diffPaths(a: any, b: any, prefix: string = ""): string[] {
    const paths: string[] = [];

    if (a === b) return paths;

    // Primitive or null comparison
    if (
        a == null ||
        b == null ||
        typeof a !== "object" ||
        typeof b !== "object"
    ) {
        if (prefix) paths.push(prefix);
        return paths;
    }

    // Array comparison
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            if (prefix) paths.push(prefix);
            return paths;
        }
        for (let i = 0; i < a.length; i++) {
            const itemPath = prefix ? `${prefix}.${i}` : `${i}`;
            paths.push(...diffPaths(a[i], b[i], itemPath));
        }
        return paths;
    }

    // Object comparison
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
        const keyPath = prefix ? `${prefix}.${key}` : key;
        paths.push(...diffPaths(a[key], b[key], keyPath));
    }

    return paths;
}

/**
 * Apply a map of path → value overrides onto a base object.
 * Returns a new object with all overrides applied (immutable).
 *
 * Paths are applied shallowest-first so leaf overrides win after parent writes.
 *
 * @param base - The base object
 * @param overrides - Map of dot-notation path → value
 * @returns A new object with overrides applied
 */
export function applyOverrides<T>(base: T, overrides: Map<string, any>): T {
    if (overrides.size === 0) return base;
    // Parents before children so leaf overrides win after parent object writes.
    const entries = [...overrides.entries()].sort(
        (a, b) => a[0].split(".").length - b[0].split(".").length,
    );
    let result = base;
    for (const [path, value] of entries) {
        result = setByPath(result, path, value);
    }
    return result;
}
