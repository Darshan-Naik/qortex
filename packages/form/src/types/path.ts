/** Depth limiter to prevent infinite recursion in recursive types */
type Prev = [never, 0, 1, 2, 3, 4];

/**
 * Generates a union of all valid dot-notation paths for a given type.
 * Supports nested objects and arrays (indexed by number).
 *
 * @example
 * ```ts
 * interface User {
 *   name: string;
 *   address: { city: string; zip: string };
 *   contacts: Array<{ type: string; value: string }>;
 * }
 * type P = Path<User>;
 * // = 'name' | 'address' | 'address.city' | 'address.zip'
 * //   | 'contacts' | `contacts.${number}` | `contacts.${number}.type` | ...
 * ```
 */
export type Path<T, D extends number = 4> = [D] extends [never]
    ? never
    : T extends readonly (infer U)[]
        ? `${number}` | `${number}.${Path<U, Prev[D]>}`
        : T extends object
            ? {
                  [K in keyof T & string]: K | `${K}.${Path<T[K], Prev[D]>}`;
              }[keyof T & string]
            : never;

/** Alias for `Path<T>` — preferred name for typed field paths. */
export type PathOf<T> = Path<T>;

/**
 * Resolves the value type at a given dot-notation path.
 *
 * @example
 * ```ts
 * type V = PathValue<User, 'address.city'>; // string
 * type A = PathValue<User, 'contacts.0'>;   // { type: string; value: string }
 * ```
 */
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
    ? K extends `${number}`
        ? T extends readonly (infer U)[]
            ? PathValue<U, Rest>
            : never
        : K extends keyof T
            ? PathValue<T[K], Rest>
            : never
    : P extends `${number}`
        ? T extends readonly (infer U)[]
            ? U
            : never
        : P extends keyof T
            ? T[P]
            : never;
