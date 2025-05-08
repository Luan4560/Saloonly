/*
  Warnings:

  - You are about to drop the column `date` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `appointments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "appointments_date_status_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "date",
DROP COLUMN "duration",
DROP COLUMN "price";

-- CreateIndex
CREATE INDEX "appointments_created_at_updated_at_idx" ON "appointments"("created_at", "updated_at");
