"use server";

import { prisma } from "@/lib/prisma";

export async function fetchDataFromYear(year: string) {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${+year + 1}-01-01`);

  try {
    console.log("🔍 År:", year);
    console.log("📅 Datumintervall:", start, "→", end);

    const rows = await prisma.transaktionsposter.findMany({
      include: {
        transaktion: true,
        konto: true,
      },
      where: {
        transaktion: {
          transaktionsdatum: {
            gte: start,
            lt: end,
          },
        },
      },
    });

    console.log("📦 transaktionsposter hittade:", rows.length);

    if (rows.length > 0) {
      console.log("🧾 Exempelrad:", {
        datum: rows[0].transaktion.transaktionsdatum,
        kontotyp: rows[0].konto.kontotyp,
        debet: rows[0].debet,
        kredit: rows[0].kredit,
      });
    }

    const grouped: { [month: string]: { inkomst: number; utgift: number } } = {};
    let totalInkomst = 0;
    let totalUtgift = 0;

    for (const row of rows) {
      const date = new Date(row.transaktion.transaktionsdatum);
      date.setDate(1);
      const key = date.toISOString();

      if (!grouped[key]) grouped[key] = { inkomst: 0, utgift: 0 };

      const kontotyp = row.konto.kontotyp;

      if (kontotyp === "Intäkt") {
        const belopp = row.kredit ?? 0;
        grouped[key].inkomst += belopp;
        totalInkomst += belopp;
      } else if (kontotyp === "Utgift") {
        const belopp = row.debet ?? 0;
        grouped[key].utgift += belopp;
        totalUtgift += belopp;
      }
    }

    const yearData = Object.entries(grouped).map(([month, values]) => ({
      month,
      inkomst: +values.inkomst.toFixed(2),
      utgift: +values.utgift.toFixed(2),
    }));

    console.log("📊 Resultat:", {
      totalInkomst,
      totalUtgift,
      totalResultat: totalInkomst - totalUtgift,
      yearDataCount: yearData.length,
    });

    return {
      totalInkomst: +totalInkomst.toFixed(2),
      totalUtgift: +totalUtgift.toFixed(2),
      totalResultat: +(totalInkomst - totalUtgift).toFixed(2),
      yearData,
    };
  } catch (err) {
    console.error("❌ fetchDataFromYear error:", err);
    return {
      totalInkomst: 0,
      totalUtgift: 0,
      totalResultat: 0,
      yearData: [],
    };
  }
}
