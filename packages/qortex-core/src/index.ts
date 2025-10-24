// Public exports
export * from "./queryManager/types";        // types for consumers
export * from "./queryManager"; // runtime API
export { serializeKey } from "./queryManager/utils"; // utility functions
export { QueryManagerCore } from "./queryManager/queryManagerCore"; // core class

// persister exports
export { createPersister, PersisterConfig, Persister } from "./persister";
