export class QortexDBError extends Error {
    constructor(message: string) {
        super(`[@qortex/db] ${message}`);
        this.name = "QortexDBError";
    }
}

export const wrapError = (error: unknown, context: string): QortexDBError => {
    const message = error instanceof Error ? error.message : String(error);
    return new QortexDBError(`${context}: ${message}`);
};
