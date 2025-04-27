/*
  Warnings:

  - You are about to drop the column `barber_shop_id` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `salonId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `salonId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `barber_shops` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `establishment_id` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barber_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_barber_shop_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_salonId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_salonId_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "establishment_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "barber_shop_id",
ADD COLUMN     "establishment_id" TEXT;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "salonId",
ADD COLUMN     "establishment_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "salonId",
ADD COLUMN     "establishment_id" TEXT,
ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "barber_shops";

-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "salt" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "opening_hours" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_phone_key" ON "establishments"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "establishments_email_key" ON "establishments"("email");

-- CreateIndex
CREATE INDEX "establishments_name_idx" ON "establishments"("name");

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
