import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node20",
  bundle: true,
  clean: true,
  sourcemap: true,
});