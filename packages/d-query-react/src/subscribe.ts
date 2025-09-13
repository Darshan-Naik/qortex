import { queryManager } from "d-query";
import { QueryKey, ReadQueryOptions } from "d-query";

/** subscribe helper used by hook */
export function subscribeToKey(key: QueryKey, notify: () => void, opts?: ReadQueryOptions<any>) {
  // subscribeQuery now handles subscription counting automatically
  return queryManager.subscribeQuery(key, notify, opts);
}
