import { createResource, zodResolver } from "../src";

describe("P1 improvements", () => {
    it("getFieldState is stable when value/meta unchanged", () => {
        const resource = createResource({
            initialData: { name: "Ada" },
        });

        const a = resource.getFieldState("name");
        const b = resource.getFieldState("name");
        expect(a).toBe(b);

        resource.set("name", "Grace");
        const c = resource.getFieldState("name");
        expect(c).not.toBe(a);
        expect(c.value).toBe("Grace");
    });

    it("array.fields cache is stable until mutation", () => {
        const resource = createResource({
            initialData: { tags: ["a", "b"] },
        });

        const first = resource.array("tags").fields;
        const second = resource.array("tags").fields;
        expect(first).toBe(second);

        resource.array("tags").append("c");
        const third = resource.array("tags").fields;
        expect(third).not.toBe(first);
        expect(third).toHaveLength(3);
    });

    it("zodResolver filters to field path in field mode", () => {
        const schema = {
            safeParse: () => ({
                success: false as const,
                error: {
                    issues: [
                        { path: ["name"], message: "bad name" },
                        { path: ["email"], message: "bad email" },
                    ],
                },
            }),
        };

        const resolver = zodResolver(schema);
        expect(resolver({}, { mode: "field", path: "name" })).toEqual({
            name: "bad name",
        });
        expect(resolver({}, { mode: "form" })).toEqual({
            name: "bad name",
            email: "bad email",
        });
    });

    it("silent hydrate does not leave validation errors", async () => {
        const storage = new Map<string, unknown>();
        storage.set("user:draft", { name: "Hydrated" });

        const resource = createResource({
            key: "user",
            initialData: { name: "" },
            persist: {
                draft: true,
                storage: {
                    get: async (key) => storage.get(key) as any,
                    set: async (key, value) => {
                        storage.set(key, value);
                    },
                    remove: async (key) => {
                        storage.delete(key);
                    },
                },
            },
            validate: {
                on: "change",
                fields: {
                    name: (v) => (!v ? "Required" : null),
                },
            },
        });

        await new Promise((r) => setTimeout(r, 20));
        expect(resource.draft?.name).toBe("Hydrated");
        expect(resource.errors).toEqual({});
    });
});
