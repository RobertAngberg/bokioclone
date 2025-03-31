"use server";

import { prisma } from "@/lib/prisma";

export async function fetchTransaktioner(year: string | null) {
  try {
    const parsedYear = parseInt(year || "");
    const data = await prisma.transaktion.findMany({
      where: year
        ? {
            transaktionsdatum: {
              gte: new Date(`${parsedYear}-01-01`),
              lte: new Date(`${parsedYear}-12-31`),
            },
          }
        : undefined,
      orderBy: {
        transaktionsdatum: "desc",
      },
    });

    return { success: true, data };
  } catch (err: any) {
    console.error("❌ fetchTransaktioner error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchTransactionDetails(transaktionsId: number) {
  try {
    const details = await prisma.transaktionspost.findMany({
      where: {
        transaktions_id: transaktionsId,
      },
      include: {
        konto: {
          select: {
            kontobeskrivning: true,
          },
        },
      },
      orderBy: {
        transaktionspost_id: "asc",
      },
    });

    return details.map((d) => ({
      transaktionspost_id: d.transaktionspost_id,
      kontobeskrivning: d.konto?.kontobeskrivning ?? "",
      debet: d.debet,
      kredit: d.kredit,
    }));
  } catch (err: any) {
    console.error("❌ fetchTransactionDetails error:", err);
    return [];
  }
}
