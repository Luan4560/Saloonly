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

// Re-export Prisma types so other files can import from @/lib/prisma
export type { Collaborator, Establishment } from "@/generated/prisma";
// Enums must be value exports for z.nativeEnum() at runtime
export {
    EstablishmentType,
    Status,
    WorkingDaysEnum,
} from "@/generated/prisma";
