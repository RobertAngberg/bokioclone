"use server";

import { prisma } from "@/lib/prisma";

export async function fetchDataFromYear(year: string) {
  console.log("🔍 Fetching data for year:", year);

  try {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${parseInt(year) + 1}-01-01`);

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

    // Group by month
    const grouped: {
      [month: string]: { inkomst: number; utgift: number };
    } = {};

    let totalInkomst = 0;
    let totalUtgift = 0;

    allRows.forEach((row) => {
      const month = new Date(row.transaktionsdatum);
      month.setDate(1); // normalize
      const key = month.toISOString();

      if (!grouped[key]) grouped[key] = { inkomst: 0, utgift: 0 };

      if (row.kontotyp === "Intäkt") {
        grouped[key].inkomst += row.belopp ?? 0;
        totalInkomst += row.belopp ?? 0;
      } else if (row.kontotyp === "Kostnad") {
        grouped[key].utgift += row.belopp ?? 0;
        totalUtgift += row.belopp ?? 0;
      }
    });

    const yearData = Object.entries(grouped).map(([month, values]) => ({
      month,
      inkomst: values.inkomst,
      utgift: values.utgift,
    }));

    return {
      totalInkomst: Number(totalInkomst.toFixed(2)),
      totalUtgift: Number(totalUtgift.toFixed(2)),
      totalResultat: Number((totalInkomst - totalUtgift).toFixed(2)),
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
