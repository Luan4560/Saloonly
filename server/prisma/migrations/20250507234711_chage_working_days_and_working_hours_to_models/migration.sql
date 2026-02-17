/*
  Warnings:

  - You are about to drop the column `working_days` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `working_hours` on the `collaborators` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkingDaysEnum" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "working_days",
DROP COLUMN "working_hours";

-- DropEnum
DROP TYPE "WorkingDays";

-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "collaborator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_days" (
    "id" TEXT NOT NULL,
    "day" "WorkingDaysEnum" NOT NULL,
    "collaborator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_days_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days" ADD CONSTRAINT "working_days_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
