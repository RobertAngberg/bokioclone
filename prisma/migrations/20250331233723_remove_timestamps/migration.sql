/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `användare` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `kunder` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `kunder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "användare" DROP COLUMN "emailVerified";

-- AlterTable
ALTER TABLE "kunder" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
