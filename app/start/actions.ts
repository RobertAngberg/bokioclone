"use server";

import { prisma } from "@/lib/prisma";

export async function fetchDataFromYear(year: string) {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${+year + 1}-01-01`);

  try {
    const rows = await prisma.transaktionspost.findMany({
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
      orderBy: {
        transaktion: {
          transaktionsdatum: "asc",
        },
      },
    });

    console.log("🔢 Antal poster:", rows.length);

    const grouped: { [month: string]: { inkomst: number; utgift: number } } = {};
    let totalInkomst = 0;
    let totalUtgift = 0;

    rows.forEach((row, i) => {
      const transaktion = row.transaktion;
      const konto = row.konto;

      // Skydda mot null-värden
      const rawDate = transaktion?.transaktionsdatum;
      const typ = konto?.kontotyp;
      const kontonummer = konto?.kontonummer ?? "??";

      if (!rawDate || !typ) {
        console.warn(`⚠️ Skipping row ${i + 1} - saknar datum eller kontotyp`);
        return;
      }

      const date = new Date(rawDate);
      date.setDate(1);
      const key = date.toISOString();

      const kredit = Number(row.kredit ?? 0);
      const debet = Number(row.debet ?? 0);

      console.log(
        `🧾 Rad ${i + 1}:`,
        `Datum=${key}, Konto=${kontonummer}, Typ=${typ}, Debet=${debet}, Kredit=${kredit}`
      );

      if (!grouped[key]) grouped[key] = { inkomst: 0, utgift: 0 };

      if (typ === "Intäkt") {
        grouped[key].inkomst += kredit;
        totalInkomst += kredit;
      }

      if (typ === "Utgift") {
        grouped[key].utgift += debet;
        totalUtgift += debet;
      }
    });

    const yearData = Object.entries(grouped).map(([month, values]) => ({
      month,
      inkomst: values.inkomst,
      utgift: values.utgift,
    }));

    console.log("📊 Summerat:", {
      totalInkomst,
      totalUtgift,
      yearData,
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
