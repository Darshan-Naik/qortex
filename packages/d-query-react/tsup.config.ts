import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  external: ["react", "d-query"],
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/d-query-react/README.md packages/d-query-react/dist/ 2>/dev/null || true"
});
