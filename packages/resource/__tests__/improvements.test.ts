import { createResource, zodResolver } from "../src";

describe("zodResolver", () => {
    it("returns null when schema parses successfully", () => {
        const schema = {
            safeParse: (data: unknown) =>
                typeof data === "object" && data !== null && "name" in (data as object)
                    ? { success: true as const }
                    : {
                          success: false as const,
                          error: { issues: [{ path: ["name"], message: "Required" }] },
                      },
        };

        const resolver = zodResolver(schema);
        expect(resolver({ name: "Ada" }, { mode: "form" })).toBeNull();
    });

    it("flattens zod-like issues into path -> message", () => {
        const schema = {
            safeParse: () => ({
                success: false as const,
                error: {
                    issues: [
                        { path: ["profile", "email"], message: "Invalid email" },
                        { path: ["name"], message: "Too short" },
                    ],
                },
            }),
        };

        const resolver = zodResolver(schema);
        expect(resolver({}, { mode: "form" })).toEqual({
            "profile.email": "Invalid email",
            name: "Too short",
        });
    });
});

describe("draft dirty tracking + array keys", () => {
    it("tracks changedFields from override paths without deep diff", () => {
        const resource = createResource({
            initialData: { profile: { name: "Ada", city: "NY" } },
        });

        resource.set("profile.name", "Grace");
        expect(resource.changedFields).toEqual(["profile.name"]);
        expect(resource.isChanged).toBe(true);

        resource.set("profile.name", "Ada");
        expect(resource.changedFields).toEqual([]);
        expect(resource.isChanged).toBe(false);
    });

    it("keeps stable array field ids across reorder", () => {
        const resource = createResource({
            initialData: { tags: ["a", "b", "c"] },
        });

        const before = resource.array("tags").fields;
        const idA = before[0].id;
        const idB = before[1].id;
        const idC = before[2].id;

        resource.array("tags").swap(0, 2);

        const after = resource.array("tags").fields;
        expect(after.map((f) => f.item)).toEqual(["c", "b", "a"]);
        expect(after[0].id).toBe(idC);
        expect(after[1].id).toBe(idB);
        expect(after[2].id).toBe(idA);
    });

    it("preserves ids for duplicate primitive values on append", () => {
        const resource = createResource({
            initialData: { tags: ["x", "x"] },
        });

        const [first, second] = resource.array("tags").fields;
        expect(first.id).not.toBe(second.id);

        resource.array("tags").append("x");
        const fields = resource.array("tags").fields;
        expect(fields).toHaveLength(3);
        expect(fields[0].id).toBe(first.id);
        expect(fields[1].id).toBe(second.id);
        expect(fields[2].id).not.toBe(first.id);
    });

    it("returns stable query and mutation object identities", () => {
        const resource = createResource({
            initialData: { name: "Ada" },
        });

        const query1 = resource.query;
        const mutation1 = resource.mutation;
        resource.set("name", "Grace");
        expect(resource.query).toBe(query1);
        expect(resource.mutation).toBe(mutation1);
    });
});
