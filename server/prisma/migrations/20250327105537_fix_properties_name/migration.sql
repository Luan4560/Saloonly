/*
  Warnings:

  - You are about to drop the column `barberId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `barberShopId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `barber_shops` table. All the data in the column will be lost.
  - You are about to drop the column `barberShopId` on the `barbers` table. All the data in the column will be lost.
  - Added the required column `barber_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barber_shop_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `barber_shops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barberId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barberShopId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";

-- DropForeignKey
ALTER TABLE "barbers" DROP CONSTRAINT "barbers_barberShopId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "barberId",
DROP COLUMN "barberShopId",
DROP COLUMN "userId",
ADD COLUMN     "barber_id" TEXT NOT NULL,
ADD COLUMN     "barber_shop_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "barber_shops" DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "barbers" DROP COLUMN "barberShopId",
ADD COLUMN     "barber_shop_id" TEXT;

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_barber_shop_id_fkey" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_shop_id_fkey" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
