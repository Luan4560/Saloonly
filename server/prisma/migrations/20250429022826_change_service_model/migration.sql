/*
  Warnings:

  - You are about to drop the column `name` on the `services` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "services_name_establishmentType_serviceType_idx";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "services_establishmentType_serviceType_idx" ON "services"("establishmentType", "serviceType");
