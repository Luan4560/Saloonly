/*
  Warnings:

  - Made the column `confirm_password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "confirm_password" SET NOT NULL;
