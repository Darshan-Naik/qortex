const PREFIX = "__db__";

export const getPrefix = (dbName: string) => `${PREFIX}:${dbName}:`;

/**
 * Match a key against a pattern with "*" wildcard support
 * Only supports prefix-based matching: "user:*", "*"
 */
export const matchPattern = (pattern: string, key: string) => {
    if (pattern === "*") return true;
    if (!pattern.includes("*")) return pattern === key;
    return key.startsWith(pattern.slice(0, pattern.indexOf("*")));
};
