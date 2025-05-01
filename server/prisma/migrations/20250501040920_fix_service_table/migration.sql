/*
  Warnings:

  - You are about to drop the column `serviceType` on the `services` table. All the data in the column will be lost.
  - Added the required column `name` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "services_establishmentType_serviceType_idx";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "serviceType",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ServiceType";

-- CreateIndex
CREATE INDEX "services_establishmentType_idx" ON "services"("establishmentType");
