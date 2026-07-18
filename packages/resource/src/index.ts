/**
 * qortex-resource — end-to-end entity / form lifecycle
 * (fetch → draft edit → validate → save → persist).
 */

export * from "./types";
export { createResource } from "./resource";
export { createCollection } from "./collection";
export { zodResolver } from "./zodResolver";
export type { ZodLikeSchema } from "./zodResolver";
