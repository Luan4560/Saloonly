/*
  Warnings:

  - You are about to drop the column `price` on the `collaborators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "price",
ALTER COLUMN "avatar" DROP NOT NULL;
