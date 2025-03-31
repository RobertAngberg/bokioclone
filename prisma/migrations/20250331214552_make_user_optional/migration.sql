-- DropForeignKey
ALTER TABLE "transaktioner" DROP CONSTRAINT "transaktioner_userId_fkey";

-- AlterTable
ALTER TABLE "transaktioner" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transaktioner" ADD CONSTRAINT "transaktioner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "användare"("id") ON DELETE SET NULL ON UPDATE CASCADE;
