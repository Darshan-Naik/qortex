import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "src/index.ts",
        query: "src/plugins/query.ts",
        validate: "src/plugins/validate.ts",
        optimistic: "src/plugins/optimistic.ts",
        persist: "src/plugins/persist.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
});
