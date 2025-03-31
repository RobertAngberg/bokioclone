/*
  Warnings:

  - You are about to drop the column `userId` on the `konton` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "konton" DROP CONSTRAINT "konton_userId_fkey";

-- AlterTable
ALTER TABLE "konton" DROP COLUMN "userId";
