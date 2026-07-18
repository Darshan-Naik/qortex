import type { FieldConfig, FieldMeta, FieldState, FieldsConfig } from "./types";
import { getByPath } from "./path";

// ═══════════════════════════════════════════════════════════
// Field Config Detection & Flattening
// ═══════════════════════════════════════════════════════════

/**
 * Detect whether a value is a FieldConfig leaf node or a nested config object.
 * A FieldConfig has `editable` or `readonly`; a nested object has neither.
 */
export function isFieldConfig(value: unknown): value is FieldConfig {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const obj = value as Record<string, unknown>;
    return "editable" in obj || "readonly" in obj;
}

/**
 * Flatten a potentially-nested FieldsConfig into a flat Map of dot-notation path → FieldConfig.
 *
 * @example
 * ```ts
 * flattenFieldsConfig({
 *   name: { editable: true },
 *   address: {
 *     city: { editable: true },
 *     zip: { editable: true },
 *   },
 *   'contacts': { editable: true },
 * })
 * // → Map {
 * //     'name' → { editable: true },
 * //     'address.city' → { editable: true },
 * //     'address.zip' → { editable: true },
 * //     'contacts' → { editable: true },
 * //   }
 * ```
 */
export function flattenFieldsConfig(
    config: FieldsConfig | undefined,
    prefix: string = "",
): Map<string, FieldConfig> {
    const result = new Map<string, FieldConfig>();

    if (!config) return result;

    for (const [key, value] of Object.entries(config)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;

        if (isFieldConfig(value)) {
            result.set(fullPath, value);
        } else if (typeof value === "object" && value !== null) {
            // Recurse into nested config
            const nested = flattenFieldsConfig(
                value as FieldsConfig,
                fullPath,
            );
            for (const [nestedPath, nestedConfig] of nested) {
                result.set(nestedPath, nestedConfig);
            }
        }
    }

    return result;
}

// ═══════════════════════════════════════════════════════════
// Field State Computation
// ═══════════════════════════════════════════════════════════

/** Default field metadata */
export const DEFAULT_FIELD_META: FieldMeta = {
    isTouched: false,
    error: undefined,
};

/**
 * Compute the public FieldState for a given path.
 *
 * @param path - Dot-notation field path
 * @param initialData - The initial/server data object
 * @param draftOverrides - Map of path → overridden value
 * @param fieldMetaMap - Map of path → FieldMeta
 * @returns The computed FieldState
 */
export function computeFieldState<V = any>(
    path: string,
    initialData: any,
    draftOverrides: Map<string, any>,
    fieldMetaMap: Map<string, FieldMeta>,
): FieldState<V> {
    const initialValue = getByPath(initialData, path);
    const hasOverride = draftOverrides.has(path);
    const value = hasOverride ? draftOverrides.get(path) : initialValue;
    const meta = fieldMetaMap.get(path) ?? DEFAULT_FIELD_META;

    return {
        value,
        initialValue,
        isChanged: hasOverride && !Object.is(value, initialValue),
        isTouched: meta.isTouched,
        error: meta.error,
    };
}

/**
 * Check if a field (or any of its descendants) is editable.
 *
 * @param path - The path to check
 * @param fieldConfigs - The flattened field config map
 * @returns Whether the path (or any child) is editable
 */
export function isEditable(
    path: string,
    fieldConfigs: Map<string, FieldConfig>,
): boolean {
    // Exact match
    const config = fieldConfigs.get(path);
    if (config) return config.editable === true && config.readonly !== true;

    // Check if any child path is editable (e.g., path='address' matches 'address.city')
    for (const [configPath, cfg] of fieldConfigs) {
        if (configPath.startsWith(path + ".") && cfg.editable === true) {
            return true;
        }
    }

    // Check if this is a child of an editable parent (e.g., path='contacts.0.email' under 'contacts')
    const segments = path.split(".");
    for (let i = segments.length - 1; i >= 1; i--) {
        const parentPath = segments.slice(0, i).join(".");
        const parentConfig = fieldConfigs.get(parentPath);
        if (parentConfig?.editable === true) return true;
    }

    return false;
}

/**
 * Collect all errors from field metadata into a flat record.
 */
export function collectErrors(
    fieldMetaMap: Map<string, FieldMeta>,
): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [path, meta] of fieldMetaMap) {
        if (meta.error) {
            errors[path] = meta.error;
        }
    }
    return errors;
}

/**
 * Check if all fields are valid (no errors in metadata).
 */
export function isAllValid(fieldMetaMap: Map<string, FieldMeta>): boolean {
    for (const meta of fieldMetaMap.values()) {
        if (meta.error) return false;
    }
    return true;
}
