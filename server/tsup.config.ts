import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "build",
  format: ["cjs"],
  external: ["@prisma/client", "@prisma/client-runtime-utils"],
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      "@": path.join(__dirname, "src"),
    };
  },
});
