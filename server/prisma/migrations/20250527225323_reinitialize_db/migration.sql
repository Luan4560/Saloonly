/*
  Warnings:

  - You are about to drop the column `closeTime` on the `SpecialDate` table. All the data in the column will be lost.
  - You are about to drop the column `isClosed` on the `SpecialDate` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `SpecialDate` table. All the data in the column will be lost.
  - You are about to drop the column `establishmentType` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `closeTime` on the `working_days` table. All the data in the column will be lost.
  - You are about to drop the column `collaboratorId` on the `working_days` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `working_days` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `working_days` table. All the data in the column will be lost.
  - Added the required column `is_closed` to the `SpecialDate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishment_type` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `close_time` to the `working_days` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day_of_week` to the `working_days` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open_time` to the `working_days` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "working_days" DROP CONSTRAINT "working_days_collaboratorId_fkey";

-- DropIndex
DROP INDEX "services_establishmentType_idx";

-- AlterTable
ALTER TABLE "SpecialDate" DROP COLUMN "closeTime",
DROP COLUMN "isClosed",
DROP COLUMN "openTime",
ADD COLUMN     "close_time" TEXT,
ADD COLUMN     "is_closed" BOOLEAN NOT NULL,
ADD COLUMN     "open_time" TEXT;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "establishmentType",
ADD COLUMN     "establishment_type" "EstablishmentType" NOT NULL;

-- AlterTable
ALTER TABLE "working_days" DROP COLUMN "closeTime",
DROP COLUMN "collaboratorId",
DROP COLUMN "dayOfWeek",
DROP COLUMN "openTime",
ADD COLUMN     "close_time" TEXT NOT NULL,
ADD COLUMN     "collaborator_id" TEXT,
ADD COLUMN     "day_of_week" "WorkingDaysEnum" NOT NULL,
ADD COLUMN     "open_time" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "services_establishment_type_idx" ON "services"("establishment_type");

-- AddForeignKey
ALTER TABLE "working_days" ADD CONSTRAINT "working_days_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
