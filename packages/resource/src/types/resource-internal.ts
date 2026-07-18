import {
    ResourceConfig,
    ResourceStatus,
    MutationStatus,
    ResourceSnapshot,
    FieldsConfig,
    ResourceKey,
    ResourceQueryConfig,
    ResourceMutationConfig,
    ResourcePersistConfig,
    ResourceValidationConfig,
    SourceUpdateMode,
    ExistingQuery,
    ExistingMutation,
    ExistingState,
    MutateMeta,
} from "./resource";
import {
    FieldMeta,
    FieldState,
    FieldConfig,
} from "./field";
import { Plugin, PluginContext } from "./plugin";

export interface InternalResourceConfig<T, R = T> {
    key?: ResourceKey;
    initialData?: T | (() => T) | (() => Promise<T>);
    source?: {
        fetch?: () => Promise<T> | T;
        save?: (draft: T, meta: MutateMeta) => Promise<R> | R;
        query?: ExistingQuery<T>;
        mutation?: ExistingMutation<T, R>;
        state?: ExistingState<T>;
        value?: T;
        onChange?: (value: T) => void;
    };
    fields?: FieldsConfig;
    fieldMode?: "open" | "strict";
    query?: ResourceQueryConfig<T>;
    mutation?: ResourceMutationConfig<T, R>;
    persist?: ResourcePersistConfig | boolean;
    validate?: ResourceValidationConfig<T>;
    sourceUpdate?: SourceUpdateMode;
    onSaveSuccess?: (data: R) => void;
    onSaveError?: (error: unknown) => void;
    plugins?: Plugin<T>[];
}

export interface InternalResourceState<T> {
    config: ResourceConfig<T>;
    initialData: T | undefined;
    status: ResourceStatus;
    statusError: unknown;
    
    draftOverrides: Map<string, any>;
    fieldMetaMap: Map<string, FieldMeta>;
    fieldStateCache: Map<string, FieldState>;
    
    mutationStatus: MutationStatus;
    mutationError: unknown;
    mutationData: any;
    
    listeners: Set<(snapshot: ResourceSnapshot<T>) => void>;
    fieldListeners: Map<string, Set<(state: FieldState) => void>>;
    
    fieldConfigs: Map<string, FieldConfig>;
    pluginCleanups: Array<() => void>;
    
    snapshotCache: ResourceSnapshot<T> | undefined;
    pluginContext: PluginContext<T> | undefined;
    
    emit: () => void;
    emitField: (path: string) => void;
    
    // Internal helpers
    getUpdatedDataInternal: () => T;
    getFieldCached: (path: string) => FieldState;
}
