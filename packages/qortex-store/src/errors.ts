/**
 * Custom error class for qortex-store errors.
 *
 * @example
 * throw new QortexStoreError("Invalid state creator");
 * // Error: [Qortex-Store] Invalid state creator
 */
export class QortexStoreError extends Error {
    constructor(message: string) {
        super(`[Qortex-Store] ${message}`);
        this.name = "QortexStoreError";
    }
}
