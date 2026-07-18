/**
 * Configuration for a single field.
 * A leaf node in the fields config tree.
 */
export type FieldConfig = {
    /** Whether the field can be edited by the user. Default: false */
    editable?: boolean;
    /** Whether the field is read-only. Default: false */
    readonly?: boolean;
};

/**
 * Nested fields configuration.
 * Can be a flat dot-notation map or a nested object tree.
 * The engine detects FieldConfig vs nested object by checking for
 * `editable` or `readonly` keys.
 *
 * @example
 * ```ts
 * // Flat
 * { 'name': { editable: true }, 'address.city': { editable: true } }
 *
 * // Nested
 * { name: { editable: true }, address: { city: { editable: true } } }
 *
 * // Mixed
 * { name: { editable: true }, address: { city: { editable: true } }, 'tags': { editable: true } }
 * ```
 */
export interface FieldsConfig {
    [key: string]: FieldConfig | FieldsConfig;
}

/**
 * Internal metadata tracked per field path.
 */
export interface FieldMeta {
    isTouched: boolean;
    error: string | undefined;
}

/**
 * Public field state returned by `getField()` and `useField()`.
 *
 * @template V - The value type of the field
 */
export interface FieldState<V = any> {
    /** Current value (with user edits applied) */
    value: V;
    /** Original value from initial/server data */
    initialValue: V;
    /** Whether the value differs from initialValue */
    isChanged: boolean;
    /** Whether the user has interacted with this field */
    isTouched: boolean;
    /** Validation error message, if any */
    error: string | undefined;
}
