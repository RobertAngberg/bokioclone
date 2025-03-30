-- CreateTable
CREATE TABLE "transaktioner" (
    "transaktions_id" SERIAL NOT NULL,
    "transaktionsdatum" TIMESTAMP(3) NOT NULL,
    "kontobeskrivning" TEXT,
    "kontotyp" TEXT,
    "belopp" DOUBLE PRECISION,
    "fil" TEXT,
    "kommentar" TEXT,

    CONSTRAINT "transaktioner_pkey" PRIMARY KEY ("transaktions_id")
);

-- CreateTable
CREATE TABLE "transaktionsposter" (
    "transaktionspost_id" SERIAL NOT NULL,
    "transaktions_id" INTEGER NOT NULL,
    "konto_id" INTEGER NOT NULL,
    "debet" DOUBLE PRECISION NOT NULL,
    "kredit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "transaktionsposter_pkey" PRIMARY KEY ("transaktionspost_id")
);

-- CreateTable
CREATE TABLE "konton" (
    "konto_id" SERIAL NOT NULL,
    "kontonummer" TEXT NOT NULL,
    "kontobeskrivning" TEXT,
    "kontotyp" TEXT,
    "sökord" TEXT,

    CONSTRAINT "konton_pkey" PRIMARY KEY ("konto_id")
);

-- AddForeignKey
ALTER TABLE "transaktionsposter" ADD CONSTRAINT "transaktionsposter_transaktions_id_fkey" FOREIGN KEY ("transaktions_id") REFERENCES "transaktioner"("transaktions_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaktionsposter" ADD CONSTRAINT "transaktionsposter_konto_id_fkey" FOREIGN KEY ("konto_id") REFERENCES "konton"("konto_id") ON DELETE CASCADE ON UPDATE CASCADE;
