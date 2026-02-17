/*
  Warnings:

  - You are about to drop the column `specialties` on the `collaborators` table. All the data in the column will be lost.
  - Added the required column `specialities` to the `collaborators` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Specialities" AS ENUM ('HAIR_CUT', 'HAIR_COLOR', 'HAIR_STYLING', 'HAIR_TREATMENT', 'HAIR_EXTENSIONS', 'HAIR_REMOVAL', 'MANICURE', 'PEDICURE', 'EYEBROW_DESIGN', 'EYEBROW_TINTING', 'EYEBROW_WASHING', 'EYEBROW_TRIMMING', 'EYEBROW_SHAPING');

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "specialties",
ADD COLUMN     "specialities" "Specialities" NOT NULL;

-- DropEnum
DROP TYPE "Specialties";
