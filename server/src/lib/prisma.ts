import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "dev" ? ["query"] : [],
});

export type { Collaborator, Establishment } from "@/generated/prisma";
export { EstablishmentType, Status, WorkingDaysEnum } from "@/generated/prisma";
