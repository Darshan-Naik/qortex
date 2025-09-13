/**
 * Default configuration values for query behavior
 */

/** Default time (ms) after which data is considered stale - 0 means always stale */
export const DEFAULT_STALE_TIME = 0;

/** Default time (ms) to keep inactive queries in cache before garbage collection */
export const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/** Default behavior for keeping previous data on error */
export const DEFAULT_KEEP_PREVIOUS_DATA = false;

/** Default placeholder data value */
export const DEFAULT_PLACEHOLDER_DATA: undefined = undefined;