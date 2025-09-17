import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/qortex/README.md packages/qortex/dist/ 2>/dev/null || true"
});
