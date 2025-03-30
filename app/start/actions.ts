"use server";

import { prisma } from "@/lib/prisma";

export async function fetchDataFromYear(year: string) {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${+year + 1}-01-01`);

  try {
    const allRows = await prisma.transaktion.findMany({
      where: {
        transaktionsdatum: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        transaktionsdatum: "asc",
      },
    });

    console.log("🔢 Rows found:", allRows.length);

    const grouped: { [month: string]: { inkomst: number; utgift: number } } = {};
    let totalInkomst = 0;
    let totalUtgift = 0;

    allRows.forEach((row) => {
      const date = new Date(row.transaktionsdatum);
      date.setDate(1);
      const key = date.toISOString();

      if (!grouped[key]) grouped[key] = { inkomst: 0, utgift: 0 };

      if (row.kontotyp === "Intäkt") {
        grouped[key].inkomst += row.belopp || 0;
        totalInkomst += row.belopp || 0;
      } else if (row.kontotyp === "Utgift") {
        grouped[key].utgift += row.belopp || 0;
        totalUtgift += row.belopp || 0;
      }
    });

    const yearData = Object.entries(grouped).map(([month, values]) => ({
      month,
      inkomst: values.inkomst,
      utgift: values.utgift,
    }));

    return {
      totalInkomst: +totalInkomst.toFixed(2),
      totalUtgift: +totalUtgift.toFixed(2),
      totalResultat: +(totalInkomst - totalUtgift).toFixed(2),
      yearData,
    };
  } catch (err) {
    console.error("❌fetchDataFromYear error:", err);
    return {
      totalInkomst: 0,
      totalUtgift: 0,
      totalResultat: 0,
      yearData: [],
    };
  }
}
