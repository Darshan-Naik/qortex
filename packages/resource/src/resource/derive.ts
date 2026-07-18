import { InternalResourceState } from "../types/state";
import { getByPath } from "../path";

export function getChangedFields<T>(state: InternalResourceState<T>): string[] {
    return [...state.draftOverrides.keys()].filter((path) => {
        return !Object.is(state.draftOverrides.get(path), getByPath(state.initialData, path));
    });
}

export function hasChanges<T>(state: InternalResourceState<T>): boolean {
    for (const [path, value] of state.draftOverrides) {
        if (!Object.is(value, getByPath(state.initialData, path))) return true;
    }
    return false;
}

export function getTouchedFields<T>(state: InternalResourceState<T>): string[] {
    const touched: string[] = [];
    for (const [path, meta] of state.fieldMetaMap) {
        if (meta.isTouched) touched.push(path);
    }
    return touched;
}
