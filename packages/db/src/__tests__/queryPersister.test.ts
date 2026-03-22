import { createQueryPersister } from "../persist/createQueryPersister";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

const createMockDB = (initialValue?: unknown) => {
    let stored: unknown = initialValue;
    return {
        get: jest.fn().mockImplementation(async () => stored),
        set: jest.fn().mockImplementation(async (_k: string, v: unknown) => { stored = v; }),
        del: jest.fn().mockImplementation(async () => { stored = undefined; }),
        has: jest.fn().mockResolvedValue(false),
        drop: jest.fn().mockResolvedValue(undefined),
        scan: jest.fn().mockResolvedValue([]),
    };
};

const flushAsync = () => new Promise((r) => setTimeout(r, 0));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeEnvelope = (burstKey = "1", queries: unknown = {}) => ({
    burstKey,
    timestamp: Date.now(),
    queries,
});

const makeQueryState = (key: string, extra: Record<string, unknown> = {}) => ({
    key,
    status: "success",
    data: [{ id: 1 }],
    staleTime: 0,
    isInvalidated: false,
    equalityStrategy: "shallow",
    refetchOnSubscribe: "stale",
    enabled: true,
    isSuccess: true,
    isError: false,
    updatedAt: Date.now(),
    persist: true,
    ...extra,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createQueryPersister", () => {
    it("returns an object with save / load / sync / clear", () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any);
        expect(typeof p.save).toBe("function");
        expect(typeof p.load).toBe("function");
        expect(typeof p.sync).toBe("function");
        expect(typeof p.clear).toBe("function");
    });
});

// ── save ──────────────────────────────────────────────────────────────────────

describe("save", () => {
    it("writes a burstKey-wrapped envelope to the DB", async () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any, { burstKey: "v1", storageKey: "test-key" });
        p.save({ users: { status: "success" } });
        await flushAsync();

        expect(db.set).toHaveBeenCalledWith("test-key", expect.objectContaining({
            burstKey: "v1",
            queries: { users: { status: "success" } },
            timestamp: expect.any(Number),
        }));
    });
});

// ── load ──────────────────────────────────────────────────────────────────────

describe("load", () => {
    it("hydrates the cache when envelope is valid and burst key matches", async () => {
        const qState = makeQueryState("users");
        const db = createMockDB(makeEnvelope("v1", { users: qState }));
        const p = createQueryPersister(db as any, { burstKey: "v1" });

        const cache = new Map<string, unknown>();
        p.load(cache, false);
        await flushAsync();

        expect(cache.has("users")).toBe(true);
        const entry = cache.get("users") as Record<string, unknown>;
        expect(entry["status"]).toBe("success");
        expect(entry["fromPersisterCache"]).toBe(true); // no prior entry
    });

    it("merges with existing cache entry (fromPersisterCache = false)", async () => {
        const qState = makeQueryState("users");
        const db = createMockDB(makeEnvelope("v1", { users: qState }));
        const p = createQueryPersister(db as any, { burstKey: "v1" });

        const cache = new Map<string, unknown>([["users", { key: "users", status: "idle" }]]);
        p.load(cache, false);
        await flushAsync();

        const entry = cache.get("users") as Record<string, unknown>;
        expect(entry["fromPersisterCache"]).toBe(false);
        expect(entry["status"]).toBe("success"); // persisted wins
    });

    it("clears and skips hydration on burst key mismatch", async () => {
        const db = createMockDB(makeEnvelope("old", { users: makeQueryState("users") }));
        const p = createQueryPersister(db as any, { burstKey: "new" });

        const cache = new Map<string, unknown>();
        p.load(cache, false);
        await flushAsync();

        expect(cache.size).toBe(0);
        expect(db.del).toHaveBeenCalled();
    });

    it("does nothing when DB is empty", async () => {
        const db = createMockDB(undefined);
        const p = createQueryPersister(db as any, { burstKey: "v1" });

        const cache = new Map<string, unknown>();
        p.load(cache, false);
        await flushAsync();

        expect(cache.size).toBe(0);
        expect(db.del).not.toHaveBeenCalled();
    });

    it("warns when called after queries are already in use", async () => {
        const db = createMockDB(undefined);
        const p = createQueryPersister(db as any);
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { });

        p.load(new Map(), true);
        await flushAsync();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining("after queries were already used"));
        warn.mockRestore();
    });
});

// ── sync ──────────────────────────────────────────────────────────────────────

describe("sync", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("debounces writes (multiple calls → single DB write)", async () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any, { debounceTime: 50 });
        const cache = new Map<string, unknown>([["users", makeQueryState("users")]]);

        p.sync(cache);
        p.sync(cache);
        p.sync(cache);
        jest.runAllTimers();
        await Promise.resolve();

        expect(db.set).toHaveBeenCalledTimes(1);
    });

    it("excludes entries with persist:false", async () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any, { debounceTime: 50 });
        const cache = new Map<string, unknown>([
            ["users", makeQueryState("users")],
            ["temp", makeQueryState("temp", { persist: false })],
        ]);

        p.sync(cache);
        jest.runAllTimers();
        await Promise.resolve();

        const [, envelope] = (db.set as jest.Mock).mock.calls[0] as any;
        expect(envelope.queries).toHaveProperty("users");
        expect(envelope.queries).not.toHaveProperty("temp");
    });

    it("strips non-serialisable fields (fetcher, equalityFn, etc.)", async () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any, { debounceTime: 50 });
        const cache = new Map<string, unknown>([
            ["users", makeQueryState("users", { fetcher: () => { }, equalityFn: () => true, fetchPromise: Promise.resolve() })],
        ]);

        p.sync(cache);
        jest.runAllTimers();
        await Promise.resolve();

        const [, envelope] = (db.set as jest.Mock).mock.calls[0] as any;
        const u = envelope.queries["users"] as Record<string, unknown>;
        expect(u["fetcher"]).toBeUndefined();
        expect(u["equalityFn"]).toBeUndefined();
        expect(u["fetchPromise"]).toBeUndefined();
        expect(u["status"]).toBe("success"); // data fields preserved
    });

    it("sync() waits for load() to finish before writing to DB", async () => {
        let resolveLoad: (value: any) => void;
        const loadPromise = new Promise((resolve) => {
            resolveLoad = resolve;
        });

        const db = createMockDB();
        // Simulate a slow DB read
        db.get.mockReturnValue(loadPromise);

        const p = createQueryPersister(db as any, { debounceTime: 50 });
        const cache = new Map();

        // 1. Start loading
        p.load(cache, false);

        // 2. Trigger a sync immediately
        cache.set("foo", { data: "bar" });
        p.sync(cache);

        // Fast-forward debounce time
        jest.advanceTimersByTime(50);
        await Promise.resolve(); // flush microtasks

        // db.set should NOT have been called yet because hydration is pending
        expect(db.set).not.toHaveBeenCalled();

        // 3. Resolve hydration
        const saved = {
            burstKey: "1",
            timestamp: Date.now(),
            queries: { persisted: { data: "old" } },
        };
        resolveLoad!(saved);
        await Promise.resolve(); // flush hydration then-block
        await Promise.resolve(); // flush sync's await hydrationPromise
        await Promise.resolve(); // extra flush for db.set

        // Now db.set should have been called, and it should include both new and old data
        // because load() merged "persisted" into the cache before sync() read from it.
        expect(db.set).toHaveBeenCalled();
        const [, envelope] = (db.set as jest.Mock).mock.calls[0];
        expect(envelope.queries.foo).toBeDefined();
        expect(envelope.queries.persisted).toBeDefined();
    });
});

// ── clear ─────────────────────────────────────────────────────────────────────

describe("clear", () => {
    it("calls db.del with the configured storageKey", async () => {
        const db = createMockDB();
        const p = createQueryPersister(db as any, { storageKey: "my-cache" });
        p.clear();
        await flushAsync();
        expect(db.del).toHaveBeenCalledWith("my-cache");
    });
});
