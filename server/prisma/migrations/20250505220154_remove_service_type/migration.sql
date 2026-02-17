/*
  Warnings:

  - You are about to drop the column `serviceType` on the `services` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "services_establishmentType_serviceType_idx";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "serviceType";

-- DropEnum
DROP TYPE "ServiceType";

-- CreateIndex
CREATE INDEX "services_establishmentType_idx" ON "services"("establishmentType");
