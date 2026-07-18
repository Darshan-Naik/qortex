import { InternalResourceState } from "../types/state";
import { ResourceSnapshot } from "../types";
import { collectErrors, isAllValid } from "../field";
import { getChangedFields, getTouchedFields } from "./derive";

export function getSnapshotInternal<T>(state: InternalResourceState<T>): ResourceSnapshot<T> {
    if (state.snapshotCache) return state.snapshotCache;

    const errors = collectErrors(state.fieldMetaMap);
    const changedFields = getChangedFields(state);
    const touchedFields = getTouchedFields(state);

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
