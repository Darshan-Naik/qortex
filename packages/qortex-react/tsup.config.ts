import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  external: ["react", "qortex"],
  onSuccess: "cd ../../ && node scripts/prepare-publish.js && cp packages/qortex-react/README.md packages/qortex-react/dist/ 2>/dev/null || true"
});
