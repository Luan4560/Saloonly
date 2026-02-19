/*
  Warnings:

  - You are about to drop the column `serviceType` on the `services` table. All the data in the column will be lost.

*/
-- DropIndex (idempotent: index may already be dropped by 20250501040920_fix_service_table)
DROP INDEX IF EXISTS "services_establishmentType_serviceType_idx";

-- AlterTable (idempotent)
ALTER TABLE "services" DROP COLUMN IF EXISTS "serviceType";

-- DropEnum (idempotent)
DROP TYPE IF EXISTS "ServiceType";

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "services_establishmentType_idx" ON "services"("establishmentType");
