/*
  Warnings:

  - You are about to drop the column `services` on the `barber_shops` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `collaborators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `barber_shops` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `specialties` on the `collaborators` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `working_days` on the `collaborators` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('MALE_HAIRCUT', 'BEARD_TRIM_STYLING', 'FADE', 'MALE_EYEBROW_SHAPING', 'MALE_HAIR_COLORING', 'FEMALE_HAIRCUT', 'MANICURE_PEDICURE', 'BLOWOUT_STRAIGHTENING', 'FEMALE_HAIR_COLORING', 'EYEBROW_DESIGN');

-- CreateEnum
CREATE TYPE "EstablishmentType" AS ENUM ('BARBERSHOP', 'BEAUTY_SALON');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "WorkingDays" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Specialties" AS ENUM ('HAIR_CUT', 'HAIR_COLOR', 'HAIR_STYLING', 'HAIR_TREATMENT', 'HAIR_EXTENSIONS', 'HAIR_REMOVAL', 'MANICURE', 'PEDICURE', 'EYEBROW_DESIGN', 'EYEBROW_TINTING', 'EYEBROW_WASHING', 'EYEBROW_TRIMMING', 'EYEBROW_SHAPING');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "duration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "barber_shops" DROP COLUMN "services",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "salt" TEXT;

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "services",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'COLLABORATOR',
ADD COLUMN     "servicesId" TEXT,
DROP COLUMN "specialties",
ADD COLUMN     "specialties" "Specialties" NOT NULL,
DROP COLUMN "working_days",
ADD COLUMN     "working_days" "WorkingDays" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "salonId" TEXT;

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "establishmentType" "EstablishmentType" NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "services_name_establishmentType_serviceType_idx" ON "services"("name", "establishmentType", "serviceType");

-- CreateIndex
CREATE INDEX "appointments_date_status_idx" ON "appointments"("date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "barber_shops_phone_key" ON "barber_shops"("phone");

-- CreateIndex
CREATE INDEX "barber_shops_name_idx" ON "barber_shops"("name");

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_servicesId_fkey" FOREIGN KEY ("servicesId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "barber_shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "barber_shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
