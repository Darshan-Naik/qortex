import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    dts: true,
    format: ["cjs", "esm"],
    sourcemap: false,
    clean: true,
    minify: true,
    treeshake: true,
    splitting: false,
    target: "es2020",
    external: ["qortex-store"],
    onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/store-react/README.md packages/store-react/dist/ 2>/dev/null || true"
});
