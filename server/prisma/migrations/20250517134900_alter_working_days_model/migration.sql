/*
  Warnings:

  - You are about to drop the column `collaborator_id` on the `working_days` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `working_days` table. All the data in the column will be lost.
  - You are about to drop the `working_hours` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `closeTime` to the `working_days` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayOfWeek` to the `working_days` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishment_id` to the `working_days` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openTime` to the `working_days` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "working_days" DROP CONSTRAINT "working_days_collaborator_id_fkey";

-- DropForeignKey
ALTER TABLE "working_hours" DROP CONSTRAINT "working_hours_collaborator_id_fkey";

-- AlterTable
ALTER TABLE "working_days" DROP COLUMN "collaborator_id",
DROP COLUMN "day",
ADD COLUMN     "closeTime" TEXT NOT NULL,
ADD COLUMN     "collaboratorId" TEXT,
ADD COLUMN     "dayOfWeek" "WorkingDaysEnum" NOT NULL,
ADD COLUMN     "establishment_id" TEXT NOT NULL,
ADD COLUMN     "openTime" TEXT NOT NULL;

-- DropTable
DROP TABLE "working_hours";

-- CreateTable
CREATE TABLE "SpecialDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "establishment_id" TEXT NOT NULL,

    CONSTRAINT "SpecialDate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "working_days" ADD CONSTRAINT "working_days_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days" ADD CONSTRAINT "working_days_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialDate" ADD CONSTRAINT "SpecialDate_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
