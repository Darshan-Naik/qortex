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
    onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/store/README.md packages/store/dist/ 2>/dev/null || true"
});
