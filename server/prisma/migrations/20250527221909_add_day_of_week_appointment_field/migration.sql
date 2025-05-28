/*
  Warnings:

  - Added the required column `day_of_week` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "day_of_week" TEXT NOT NULL;
