import { createResource, createCollection } from "../src";

describe("P0 correctness fixes", () => {
    describe("applyFieldPatch uses draft current", () => {
        it("functional set sees parent-override draft value", () => {
            const resource = createResource({
                initialData: { profile: { name: "Ada", city: "NY" } },
            });

            resource.set("profile", { name: "Grace", city: "SF" });
            resource.set("profile.name", (prev: string) => prev + "!");

            expect(resource.get("profile.name")).toBe("Grace!");
            expect(resource.draft?.profile).toEqual({ name: "Grace!", city: "SF" });
        });

        it("skips emit bookkeeping for no-op sets", () => {
            const resource = createResource({
                initialData: { name: "Ada" },
            });
            let emits = 0;
            resource.subscribe(() => {
                emits += 1;
            });

            resource.set("name", "Ada");
            expect(emits).toBe(0);
            expect(resource.isChanged).toBe(false);
        });
    });

    describe("emitField ancestors", () => {
        it("notifies parent field subscribers when a child path changes", () => {
            const resource = createResource({
                initialData: { profile: { name: "Ada" } },
            });

            let parentSees: string | undefined;
            resource.subscribeField("profile", (field) => {
                parentSees = (field.value as { name: string }).name;
            });

            resource.set("profile.name", "Grace");
            expect(parentSees).toBe("Grace");
        });
    });

    describe("source reset clears meta", () => {
        it("clears field errors when source resets draft", async () => {
            const resource = createResource({
                initialData: { name: "" },
                validate: {
                    fields: {
                        name: (v) => (!v ? "Required" : null),
                    },
                },
                source: {
                    save: async (draft) => draft,
                },
            });

            await resource.validateField("name");
            expect(resource.errors.name).toBe("Required");

            resource.set("name", "Ada");
            const result = await resource.save();
            expect(result.success).toBe(true);
            expect(resource.errors).toEqual({});
            expect(resource.isValid).toBe(true);
        });
    });

    describe("mutateArray canEdit", () => {
        it("does not mutate array keys when field is readonly", () => {
            const resource = createResource({
                initialData: { tags: ["a", "b"] },
                fields: { tags: { readonly: true } },
            });

            const before = resource.array("tags").fields.map((f) => f.id);
            resource.array("tags").append("c");
            const after = resource.array("tags").fields.map((f) => f.id);

            expect(resource.draft?.tags).toEqual(["a", "b"]);
            expect(after).toEqual(before);
        });
    });

    describe("collection version", () => {
        it("bumps version on data changes while status stays ready", () => {
            const collection = createCollection<{ id: string; title: string }>({
                getId: (t) => t.id,
            });

            collection.setAll([{ id: "1", title: "One" }]);
            expect(collection.status).toBe("ready");
            const v1 = collection.version;

            collection.addOne({ id: "2", title: "Two" });
            expect(collection.status).toBe("ready");
            expect(collection.version).toBeGreaterThan(v1);
        });
    });
});
