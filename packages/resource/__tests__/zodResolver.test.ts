import { zodResolver } from "../src";

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

    it("filters errors to the requested field path in field mode", () => {
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
});
