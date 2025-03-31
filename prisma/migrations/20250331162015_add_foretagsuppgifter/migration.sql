-- DropForeignKey
ALTER TABLE "transaktionsposter" DROP CONSTRAINT "transaktionsposter_konto_id_fkey";

-- DropForeignKey
ALTER TABLE "transaktionsposter" DROP CONSTRAINT "transaktionsposter_transaktions_id_fkey";

-- AlterTable
ALTER TABLE "transaktioner" ALTER COLUMN "transaktionsdatum" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "transaktionsposter" ALTER COLUMN "transaktions_id" DROP NOT NULL,
ALTER COLUMN "konto_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "kunder" (
    "id" SERIAL NOT NULL,
    "FöretagEllerPrivat" TEXT,
    "Företagsnamn" TEXT,
    "Organisationsnummer" TEXT,
    "Momsnummer" BIGINT,
    "Kundnummer" BIGINT,
    "Postadress" TEXT,
    "Postadress2" TEXT,
    "Postnummer" INTEGER,
    "Stad" TEXT,
    "BetalningsvillkorDagar" INTEGER,
    "Dröjsmålsränta" DECIMAL(5,2),
    "Leverans" TEXT,
    "OmvändSkattskyldighet" BOOLEAN,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kunder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "företagsuppgifter" (
    "id" SERIAL NOT NULL,
    "företagsnamn" TEXT NOT NULL,
    "organisationsnummer" TEXT NOT NULL,
    "momsnummer" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "adress2" TEXT,
    "postnummer" TEXT NOT NULL,
    "stad" TEXT NOT NULL,

    CONSTRAINT "företagsuppgifter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaktionsposter" ADD CONSTRAINT "transaktionsposter_konto_id_fkey" FOREIGN KEY ("konto_id") REFERENCES "konton"("konto_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaktionsposter" ADD CONSTRAINT "transaktionsposter_transaktions_id_fkey" FOREIGN KEY ("transaktions_id") REFERENCES "transaktioner"("transaktions_id") ON DELETE CASCADE ON UPDATE NO ACTION;
