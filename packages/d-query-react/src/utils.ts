import type { UseQueryResult } from "./types";

export function snapshotEqual<T>(a: UseQueryResult<T> | null, b: UseQueryResult<T> | null) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.status !== b.status) return false;
  if (a.isStale !== b.isStale) return false;
  if (a.updatedAt !== b.updatedAt) return false;
  if (a.isPlaceholderData !== b.isPlaceholderData) return false;
  if (a.error !== b.error) return false;

  const da = a.data as any;
  const db = b.data as any;
  if (da === db) return true;
  if (typeof da === "object" && typeof db === "object" && da != null && db != null) {
    try {
      const ka = Object.keys(da);
      const kb = Object.keys(db);
      if (ka.length !== kb.length) return false;
      for (let i = 0; i < ka.length; i++) {
        const k = ka[i];
        if (da[k] !== db[k]) return false;
      }
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function computeStatusFlags<T>(state: { status: "idle" | "fetching" | "success" | "error"; data?: T }, enabled: boolean | undefined) {
  const isLoading = (state.status === "idle" && state.data === undefined && (enabled ?? true));
  const isFetching = state.status === "fetching";
  const isError = state.status === "error";
  const isSuccess = state.status === "success" && state.data !== undefined;
  return { isLoading, isFetching, isError, isSuccess } as const;
}


