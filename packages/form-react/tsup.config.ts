import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/query.ts", "src/store.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: [
        "react",
        "qortex-form",
        "qortex-query",
        "qortex-query-react",
        "qortex-store",
        "qortex-store-react",
    ],
});
