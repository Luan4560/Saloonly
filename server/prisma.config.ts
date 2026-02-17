import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Schema as string is valid at runtime; Prisma CLI was throwing path.join(schema) when schema was an object
} as unknown as Parameters<typeof defineConfig>[0]);
