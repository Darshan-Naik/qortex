import { InternalResourceState } from "./state";
import { ResourceSnapshot } from "../types";
import { collectErrors, isAllValid } from "../field";
import { getByPath } from "../path";

export function getSnapshotInternal<T>(state: InternalResourceState<T>): ResourceSnapshot<T> {
    if (state.snapshotCache) return state.snapshotCache;

    const errors = collectErrors(state.fieldMetaMap);
    const changedFields = [...state.draftOverrides.keys()].filter((path) => {
        const initialVal = getByPath(state.initialData, path);
        return !Object.is(state.draftOverrides.get(path), initialVal);
    });
    const touchedFields: string[] = [];
    for (const [path, meta] of state.fieldMetaMap) {
        if (meta.isTouched) touchedFields.push(path);
    }

    state.snapshotCache = {
        data: state.initialData,
        updatedData: state.getUpdatedDataInternal(),
        status: state.status,
        isLoading: state.status === "loading",
        isChanged: changedFields.length > 0,
        isValid: isAllValid(state.fieldMetaMap),
        isMutating: state.mutationStatus === "mutating",
        changedFields,
        touchedFields,
        errors,
        mutationStatus: state.mutationStatus,
        mutationError: state.mutationError,
        mutationData: state.mutationData,
    };

    return state.snapshotCache;
}
