import { createStorePersister } from "../persist/createStorePersister";

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

const makeEnvelope = <T>(state: T, burstKey = "1") => ({
    burstKey,
    timestamp: Date.now(),
    state,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createStorePersister", () => {
    it("returns an object with hydrate / persist / clear", () => {
        const p = createStorePersister(createMockDB() as any);
        expect(typeof p.hydrate).toBe("function");
        expect(typeof p.persist).toBe("function");
        expect(typeof p.clear).toBe("function");
    });
});

// ── hydrate ───────────────────────────────────────────────────────────────────

describe("hydrate", () => {
    it("returns the stored state when envelope is valid and burst key matches", async () => {
        const saved = { theme: "dark", count: 42 };
        const db = createMockDB(makeEnvelope(saved, "v1"));
        const p = createStorePersister(db as any, { burstKey: "v1" });

        const result = await p.hydrate();
        expect(result).toEqual(saved);
    });

    it("returns undefined when DB is empty", async () => {
        const db = createMockDB(undefined);
        const p = createStorePersister(db as any);

        expect(await p.hydrate()).toBeUndefined();
    });

    it("returns undefined and clears on burst key mismatch", async () => {
        const db = createMockDB(makeEnvelope({ count: 99 }, "old-key"));
        const p = createStorePersister(db as any, { burstKey: "new-key" });

        const result = await p.hydrate();
        expect(result).toBeUndefined();
        await Promise.resolve(); // flush del
        expect(db.del).toHaveBeenCalled();
    });
});

// ── persist ───────────────────────────────────────────────────────────────────

describe("persist", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("writes the full state to DB after the debounce delay", async () => {
        const db = createMockDB();
        const p = createStorePersister(db as any, { debounceTime: 50, burstKey: "v1", storageKey: "test" });

        p.persist({ count: 1 });
        jest.runAllTimers();
        await Promise.resolve();

        expect(db.set).toHaveBeenCalledWith("test", expect.objectContaining({
            burstKey: "v1",
            state: { count: 1 },
        }));
    });

    it("debounces — only the last call in the window is written", async () => {
        const db = createMockDB();
        const p = createStorePersister(db as any, { debounceTime: 50 });

        p.persist({ count: 1 });
        p.persist({ count: 2 });
        p.persist({ count: 3 });
        jest.runAllTimers();
        await Promise.resolve();

        expect(db.set).toHaveBeenCalledTimes(1);
        const [, envelope] = (db.set as jest.Mock).mock.calls[0] as any;
        expect(envelope.state).toEqual({ count: 3 });
    });

    it("persists only the selected slice when select is configured", async () => {
        const db = createMockDB();
        const p = createStorePersister(db as any, {
            debounceTime: 50,
            select: (s: any) => ({ theme: s.theme }),
        });

        p.persist({ theme: "dark", count: 99, volatile: true });
        jest.runAllTimers();
        await Promise.resolve();

        const [, envelope] = (db.set as jest.Mock).mock.calls[0] as any;
        expect(envelope.state).toEqual({ theme: "dark" });
    });

    it("persist() waits for hydrate() to finish before writing to DB", async () => {
        let resolveHydrate: (value: any) => void;
        const hydratePromise = new Promise((resolve) => {
            resolveHydrate = resolve;
        });

        const db = createMockDB();
        // Simulate a slow DB read
        db.get.mockReturnValue(hydratePromise);

        const p = createStorePersister(db as any, { debounceTime: 50 });

        // 1. Start hydration
        const hPromise = p.hydrate();

        // 2. Trigger a persist immediately (e.g. from an action)
        p.persist({ count: 1 });

        // Fast-forward debounce time
        jest.advanceTimersByTime(50);
        await Promise.resolve(); // flush microtasks

        // db.set should NOT have been called yet because hydration is pending
        expect(db.set).not.toHaveBeenCalled();

        // 3. Resolve hydration
        resolveHydrate!({ burstKey: "1", timestamp: Date.now(), state: { count: 0 } });
        await hPromise; // Wait for hydrate to finish internally
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        // Now db.set should have been called
        expect(db.set).toHaveBeenCalled();
    });
});

// ── clear ─────────────────────────────────────────────────────────────────────

describe("clear", () => {
    it("calls db.del with the configured storageKey", async () => {
        const db = createMockDB();
        const p = createStorePersister(db as any, { storageKey: "my-store-cache" });
        p.clear();
        await Promise.resolve();
        expect(db.del).toHaveBeenCalledWith("my-store-cache");
    });
});

// ── integration: works with createStore pattern ───────────────────────────────

describe("integration with createStore pattern", () => {
    it("hydrate() result can be applied to a store via set(state, true)", async () => {
        const saved = { count: 42 };
        const db = createMockDB(makeEnvelope(saved, "v1"));
        const p = createStorePersister<{ count: number }>(db as any, { burstKey: "v1" });

        // Simulate what createStore does internally
        let storeState = { count: 0 };
        const hydratedState = await p.hydrate();
        if (hydratedState != null) storeState = hydratedState;

        expect(storeState).toEqual({ count: 42 });
    });
});
