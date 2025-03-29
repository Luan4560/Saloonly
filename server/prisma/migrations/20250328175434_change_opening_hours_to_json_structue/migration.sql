/*
  Warnings:

  - Changed the type of `opening_hours` on the `barber_shops` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "barber_shops" DROP COLUMN "opening_hours",
ADD COLUMN     "opening_hours" JSONB NOT NULL;
