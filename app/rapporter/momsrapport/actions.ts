"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getMomsrapport(year: string, kvartal?: string) {
  let from = `${year}-01-01`;
  let to = `${year}-12-31`;

  if (kvartal === "Q1") {
    from = `${year}-01-01`;
    to = `${year}-03-31`;
  } else if (kvartal === "Q2") {
    from = `${year}-04-01`;
    to = `${year}-06-30`;
  } else if (kvartal === "Q3") {
    from = `${year}-07-01`;
    to = `${year}-09-30`;
  } else if (kvartal === "Q4") {
    from = `${year}-10-01`;
    to = `${year}-12-31`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      t.id AS transaktions_id,
      t.transaktionsdatum,
      k.kontonummer,
      k.beskrivning,
      tp.debet,
      tp.kredit
    FROM transaktioner t
    JOIN transaktionsposter tp ON t.id = tp.transaktions_id
    JOIN konton k ON tp.konto_id = k.id
    WHERE t.transaktionsdatum BETWEEN $1 AND $2
    `,
    [from, to]
  );

  const fältMap: Record<string, { fält: string; beskrivning: string; belopp: number }> = {};

  const add = (fält: string, beskrivning: string, belopp: number) => {
    if (!fältMap[fält]) fältMap[fält] = { fält, beskrivning, belopp: 0 };
    fältMap[fält].belopp += belopp;
    console.log(`✅ +${belopp} kr till fält ${fält} (${beskrivning})`);
  };

  // Identifiera transaktioner som innehåller 5615 (billeasing)
  const billeasingTransaktioner = new Set<number>();
  for (const rad of rows) {
    if (rad.kontonummer === "5615") {
      billeasingTransaktioner.add(rad.transaktions_id);
    }
  }

  for (const rad of rows) {
    const { kontonummer, debet, kredit, transaktions_id } = rad;
    const netto = kredit - debet;
    console.log(`🔍 Konto ${kontonummer} – Debet: ${debet}, Kredit: ${kredit}, Netto: ${netto}`);

    // Försäljning
    if (/^30\d\d$/.test(kontonummer) || /^31\d\d$/.test(kontonummer)) {
      add("05", "Momspliktig försäljning", netto);
    }

    // Utgående moms
    if (["2611", "2612", "2613"].includes(kontonummer)) add("10", "Utgående moms 25%", kredit);
    if (["2620", "2621", "2622", "2623"].includes(kontonummer))
      add("11", "Utgående moms 12%", kredit);
    if (["2630", "2631", "2632", "2633"].includes(kontonummer))
      add("12", "Utgående moms 6%", kredit);

    // Omvänd skattskyldighet (ej import)
    if (["4515", "4516", "4517"].includes(kontonummer)) add("20", "Inköp varor från EU", debet);
    if (["4535", "4536", "4537"].includes(kontonummer)) add("21", "Inköp tjänster från EU", debet);
    if (["4531", "4532", "4533"].includes(kontonummer))
      add("22", "Inköp tjänster utanför EU", debet);
    if (["4425", "213", "214"].includes(kontonummer))
      add("24", "Inköp tjänster i Sverige (omv. moms)", debet);
    if (["2614"].includes(kontonummer)) add("30", "Utgående moms 25% (omv moms)", kredit);
    if (["2624"].includes(kontonummer)) add("31", "Utgående moms 12% (omv moms)", kredit);
    if (["2634"].includes(kontonummer)) add("32", "Utgående moms 6% (omv moms)", kredit);

    // Import (Bokio-stil)
    if (["4545", "4546", "4547"].includes(kontonummer))
      add("50", "Beskattningsunderlag import", debet);
    if (["2615"].includes(kontonummer)) add("60", "Utgående moms 25% (import)", kredit);
    if (["2625"].includes(kontonummer)) add("61", "Utgående moms 12% (import)", kredit);
    if (["2635"].includes(kontonummer)) add("62", "Utgående moms 6% (import)", kredit);

    // Ingående moms – 50 % avdrag om det är billeasing (5615 med i samma transaktion)
    if (["2640", "2645", "210", "248", "250", "251"].includes(kontonummer)) {
      const ärBilleasing = billeasingTransaktioner.has(transaktions_id);
      const justerat = ärBilleasing ? debet / 2 : debet;
      console.log(
        `🧾 Ingående moms på ${kontonummer}, ${ärBilleasing ? "Billeasing – halveras" : "fullt avdrag"}`
      );
      add("48", "Ingående moms att dra av", justerat);
    }

    // Momsfri försäljning
    if (["3108"].includes(kontonummer)) add("35", "Varuförsäljning till EU", netto);
    if (["252"].includes(kontonummer)) add("36", "Export varor utanför EU", netto);
    if (["192"].includes(kontonummer)) add("39", "Tjänst till EU", netto);
    if (["191"].includes(kontonummer)) add("40", "Tjänst utanför EU", netto);
    if (["3300", "3305"].includes(kontonummer)) add("41", "Försäljning med omv moms", netto);
  }

  const sumFält = (...fält: string[]) =>
    fält.reduce((sum, f) => sum + (fältMap[f]?.belopp ?? 0), 0);
  const utgående = sumFält("10", "11", "12", "30", "31", "32", "60", "61", "62");
  const ingående = fältMap["48"]?.belopp ?? 0;
  const moms49 = utgående - ingående;

  console.log(`📊 Utgående moms: ${utgående}`);
  console.log(`📊 Ingående moms: ${ingående}`);
  console.log(`📦 Ruta 49 beräknad till: ${moms49}`);

  fältMap["49"] = {
    fält: "49",
    beskrivning: "Moms att betala eller få tillbaka",
    belopp: moms49,
  };

  return Object.values(fältMap).filter((rad) => rad.belopp !== 0);
}
