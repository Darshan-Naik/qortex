import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: true,
  clean: true,
  external: ["react", "d-query"]
});
