/*
  Warnings:

  - You are about to drop the `barbers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barber_id_fkey";

-- DropForeignKey
ALTER TABLE "barbers" DROP CONSTRAINT "barbers_barber_shop_id_fkey";

-- DropTable
DROP TABLE "barbers";

-- CreateTable
CREATE TABLE "collaborators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "services" TEXT[],
    "specialties" TEXT[],
    "price" DECIMAL(65,30) NOT NULL,
    "avatar" TEXT NOT NULL,
    "working_days" TEXT[],
    "working_hours" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "barber_shop_id" TEXT,

    CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_email_key" ON "collaborators"("email");

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_barber_shop_id_fkey" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
