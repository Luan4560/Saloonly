import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "build",
  format: ["cjs"],
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      "@": path.join(__dirname, "src"),
    };
  },
});
