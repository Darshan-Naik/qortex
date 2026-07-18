import { useSyncExternalStore, useMemo, useRef } from "react";
import { createResource } from "qortex-resource";
import { useField } from "./useField";
import { useFieldArray } from "./useFieldArray";
import { bindResourceActions, serializeResourceKey } from "./bindResourceActions";
import type { ResourceConfig, Resource } from "qortex-resource";

type BoundActions<T, R> = ReturnType<typeof bindResourceActions<T, R>>;

type BoundResourceResult<T, R> = Resource<T, R>["snapshot"] &
    BoundActions<T, R> & { resource: Resource<T, R> };

type BoundHooks<T, R, UseResource> = {
    useResource: UseResource;
    useField: (path: string) => ReturnType<typeof useField>;
    useFieldArray: (path: string) => ReturnType<typeof useFieldArray>;
    /** Active resource — throws if factory hooks were never initialized via `useResource(params)`. */
    get resource(): Resource<T, R>;
    destroy: () => void;
};

/**
 * Create module-level bound hooks that share one resource instance.
 *
 * Avoids React Context and prop drilling. Suitable for a **single active form**
 * (one identity at a time). Call `destroy()` in tests or HMR cleanup.
 *
 * **Static config** — identity fixed at module init:
 * ```ts
 * const { useResource, useField } = createResourceHooks({
 *   initialData: { name: "" },
 *   source: { save: (d) => api.save(d) },
 * });
 * useResource(); // no args
 * ```
 *
 * **Factory** — dynamic identity (e.g. product id). Pass params into
 * `useResource`; recreate when the resolved `key` changes. Put `key` (and
 * closures over the id) inside the factory return:
 * ```ts
 * const { useResource, useField } = createResourceHooks((productId: string) => ({
 *   key: ["product", productId],
 *   source: {
 *     fetch: () => api.getProduct(productId),
 *     save: (d) => api.updateProduct(productId, d),
 *   },
 * }));
 *
 * // ProductEditor.tsx
 * useResource(productId);
 * // deep child
 * useField("name");
 * ```
 *
 * Only one params identity should be active in the tree at a time. Switching
 * `productId` destroys the previous instance and loads the new one.
 */
export function createResourceHooks<T, R = T>(
    config: ResourceConfig<T, R>,
): BoundHooks<T, R, () => BoundResourceResult<T, R>>;
export function createResourceHooks<T, R = T, P = unknown>(
    factory: (params: P) => ResourceConfig<T, R>,
): BoundHooks<T, R, (params: P) => BoundResourceResult<T, R>>;
export function createResourceHooks<T, R = T, P = unknown>(
    configOrFactory: ResourceConfig<T, R> | ((params: P) => ResourceConfig<T, R>),
) {
    const isFactory = typeof configOrFactory === "function";
    const staticConfig = isFactory ? null : (configOrFactory as ResourceConfig<T, R>);

    let resourceInstance: Resource<T, R> | null = isFactory
        ? null
        : createResource(staticConfig!);
    let activeKeyStr = isFactory ? null : serializeResourceKey(staticConfig!.key);
    let actions: BoundActions<T, R> | null = resourceInstance
        ? bindResourceActions(resourceInstance)
        : null;

    const factory = isFactory
        ? (configOrFactory as (params: P) => ResourceConfig<T, R>)
        : null;

    function syncInstance(config: ResourceConfig<T, R>): Resource<T, R> {
        const keyStr = serializeResourceKey(config.key);
        if (resourceInstance && activeKeyStr === keyStr) {
            return resourceInstance;
        }
        resourceInstance?.destroy();
        resourceInstance = createResource(config);
        activeKeyStr = keyStr;
        actions = bindResourceActions(resourceInstance);
        return resourceInstance;
    }

    function requireInstance(): Resource<T, R> {
        if (!resourceInstance || !actions) {
            throw new Error(
                "createResourceHooks: call useResource(params) in a parent before useField / useFieldArray",
            );
        }
        return resourceInstance;
    }

    function useBoundResource(params?: P): BoundResourceResult<T, R> {
        if (factory && factory.length > 0 && params === undefined) {
            throw new Error(
                "createResourceHooks(factory): useResource(params) requires params so key/fetch can resolve",
            );
        }

        const config = factory ? factory(params as P) : staticConfig!;
        const keyStr = serializeResourceKey(config.key);
        const configRef = useRef(config);
        configRef.current = config;

        const resource = useMemo(() => syncInstance(configRef.current), [keyStr]);

        const snapshot = useSyncExternalStore(
            (listener: any) => resource.subscribe(listener),
            () => resource.snapshot,
        );

        return {
            ...snapshot,
            ...bindResourceActions(resource),
            resource,
        };
    }

    function useBoundField(path: string) {
        return useField(requireInstance(), path);
    }

    function useBoundFieldArray(path: string) {
        return useFieldArray(requireInstance(), path);
    }

    return {
        useResource: useBoundResource as any,
        useField: useBoundField,
        useFieldArray: useBoundFieldArray,
        get resource() {
            return requireInstance();
        },
        destroy: () => {
            resourceInstance?.destroy();
            resourceInstance = null;
            activeKeyStr = null;
            actions = null;
        },
    };
}
