import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/persister-export.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: "es2020",
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/qortex/README.md packages/qortex/dist/ 2>/dev/null || true"
});
