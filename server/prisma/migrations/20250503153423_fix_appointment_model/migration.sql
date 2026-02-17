/*
  Warnings:

  - You are about to drop the column `barber_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `barber_shop_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `collaborator_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barber_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "barber_id",
DROP COLUMN "barber_shop_id",
DROP COLUMN "service",
ADD COLUMN     "collaborator_id" TEXT NOT NULL,
ADD COLUMN     "service_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
