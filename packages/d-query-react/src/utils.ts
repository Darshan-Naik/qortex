import type { QueryKey } from "dquery-core";

/** Normalize query keys to a string for internal maps */
export function serializeKey(key: QueryKey): string {
    return Array.isArray(key) ? key.join(",") : String(key);
}
