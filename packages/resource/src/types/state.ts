import {
    ResourceConfig,
    ResourceStatus,
    MutationStatus,
    ResourceSnapshot,
} from "./resource";
import {
    FieldMeta,
    FieldState,
    FieldConfig,
} from "./field";
import { PluginContext } from "./plugin";

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
