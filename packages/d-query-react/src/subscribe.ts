import { queryManager } from "d-query";
import { QueryKey } from "d-query";

/** subscribe helper used by hook */
export function subscribeToKey(key: QueryKey, notify: () => void) {
  queryManager.onSubscribe(key);
  const unsub = queryManager.subscribeQuery(key, notify);
  return () => {
    unsub();
    queryManager.onUnsubscribe(key);
  };
}
