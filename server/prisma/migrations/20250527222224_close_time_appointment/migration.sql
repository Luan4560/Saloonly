/*
  Warnings:

  - Added the required column `close_time` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "close_time" TEXT NOT NULL;
