import { InternalResourceState } from "../types/state";
import { MutationResult } from "../types";
import { isAllValid } from "../field";
import { getByPath } from "../path";

export async function validate<T>(state: InternalResourceState<T>): Promise<boolean> {
    for (const plugin of state.config.plugins ?? []) {
        const result = await plugin.onBeforeMutate?.(
            state.getUpdatedDataInternal(),
            state.pluginContext!
        );
        if (result === false) return false;
    }
    return isAllValid(state.fieldMetaMap);
}

export async function mutateAsyncInternal<T>(state: InternalResourceState<T>): Promise<MutationResult> {
    if (!state.config.mutate) {
        return {
            success: false,
            data: undefined,
            error: new Error("[qortex-resource] No mutate function configured."),
        };
    }

    // Run plugin onBeforeMutate hooks
    for (const plugin of state.config.plugins ?? []) {
        const result = await plugin.onBeforeMutate?.(
            state.getUpdatedDataInternal(),
            state.pluginContext!
        );
        if (result === false) {
            return {
                success: false,
                data: undefined,
                error: new Error("Mutation blocked by plugin."),
            };
        }
    }

    if (!isAllValid(state.fieldMetaMap)) {
        return {
            success: false,
            data: undefined,
            error: new Error("Validation failed."),
        };
    }

    const changedFields = [...state.draftOverrides.keys()].filter((path) => {
        const initialVal = getByPath(state.initialData, path);
        return !Object.is(state.draftOverrides.get(path), initialVal);
    });
    const meta = {
        changedFields,
        isChanged: changedFields.length > 0,
    };

    state.mutationStatus = "mutating";
    state.mutationError = undefined;
    state.emit();

    try {
        const result = await state.config.mutate(
            state.initialData,
            state.getUpdatedDataInternal(),
            meta
        );

        state.mutationStatus = "success";
        state.mutationData = result;
        state.mutationError = undefined;

        if (result !== undefined) {
            state.initialData = result as T;
        } else {
            state.initialData = state.getUpdatedDataInternal();
        }
        state.draftOverrides.clear();
        state.fieldMetaMap.clear();

        for (const plugin of state.config.plugins ?? []) {
            plugin.onAfterMutate?.(result, state.pluginContext!);
        }

        state.config.onMutateSuccess?.(result);
        state.emit();
        return { success: true, data: result, error: undefined };
    } catch (error) {
        state.mutationStatus = "error";
        state.mutationError = error;
        state.mutationData = undefined;

        for (const plugin of state.config.plugins ?? []) {
            plugin.onMutateError?.(error, state.pluginContext!);
        }

        state.config.onMutateError?.(error);
        state.emit();
        return { success: false, data: undefined, error };
    }
}
