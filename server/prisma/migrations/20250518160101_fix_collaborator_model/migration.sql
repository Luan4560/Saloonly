/*
  Warnings:

  - You are about to drop the column `specialities` on the `collaborators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "specialities";

-- DropEnum
DROP TYPE "Specialities";

-- CreateTable
CREATE TABLE "specialities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialities_pkey" PRIMARY KEY ("id")
);
