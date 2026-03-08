import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/persister.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: "es2020",
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/query/README.md packages/query/dist/ 2>/dev/null || true"
});
