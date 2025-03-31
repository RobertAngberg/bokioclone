/*
  Warnings:

  - You are about to drop the `företagsuppgifter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `konton` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `kunder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `transaktioner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "konton" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "kunder" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transaktioner" ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "företagsuppgifter";

-- CreateTable
CREATE TABLE "användare" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "image" TEXT,
    "företagsnamn" TEXT,
    "organisationsnummer" TEXT,
    "momsnummer" TEXT,
    "adress" TEXT,
    "adress2" TEXT,
    "postnummer" TEXT,
    "stad" TEXT,

    CONSTRAINT "användare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "användare_email_key" ON "användare"("email");

-- AddForeignKey
ALTER TABLE "transaktioner" ADD CONSTRAINT "transaktioner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "användare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konton" ADD CONSTRAINT "konton_userId_fkey" FOREIGN KEY ("userId") REFERENCES "användare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunder" ADD CONSTRAINT "kunder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "användare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
