"use server";

import { prisma } from "@/lib/prisma";

export async function fetchHuvudbok() {
  try {
    const rows = await prisma.transaktionspost.findMany({
      include: {
        konto: true,
        transaktion: true,
      },
      orderBy: [{ konto: { konto_id: "asc" } }, { transaktion: { transaktionsdatum: "asc" } }],
    });

    return rows.map((row) => ({
      kontonummer: row.konto?.kontonummer ?? "",
      kontobeskrivning: row.konto?.kontobeskrivning ?? "",
      transaktionsdatum: row.transaktion.transaktionsdatum.toISOString(),
      fil: row.transaktion.fil || "",
      debet: row.debet,
      kredit: row.kredit,
    }));
  } catch (error) {
    console.error("❌ fetchHuvudbok error:", error);
    return [];
  }
}
