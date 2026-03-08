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
  external: ["react", "@qortex/query"],
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/query-react/README.md packages/query-react/dist/ 2>/dev/null || true"
});
