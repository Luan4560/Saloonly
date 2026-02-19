import path from "path";
import { config } from "dotenv";

// Load root .env: from config dir, then parent of cwd (when cwd is server/), then cwd
config({ path: path.resolve(__dirname, "../../.env") });
config({ path: path.resolve(process.cwd(), "..", ".env") });
config({ path: path.join(process.cwd(), ".env") });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  // Schema as string is valid at runtime; Prisma CLI was throwing path.join(schema) when schema was an object
} as unknown as Parameters<typeof defineConfig>[0]);
