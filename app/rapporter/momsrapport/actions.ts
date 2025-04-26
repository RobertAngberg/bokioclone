"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getMomsrapport(year: string) {
  const { rows } = await pool.query(
    `
    SELECT 
      t.id AS transaktions_id,
      t.transaktionsdatum,
      k.kontonummer,
      k.beskrivning, -- ← fixat här
      tp.debet,
      tp.kredit
    FROM transaktioner t
    JOIN transaktionsposter tp ON t.id = tp.transaktions_id
    JOIN konton k ON tp.konto_id = k.id
    WHERE EXTRACT(YEAR FROM t.transaktionsdatum) = $1
    `,
    [year]
  );

  const fältMap: Record<string, { fält: string; beskrivning: string; belopp: number }> = {};

  const add = (fält: string, beskrivning: string, belopp: number) => {
    if (!fältMap[fält]) fältMap[fält] = { fält, beskrivning, belopp: 0 };
    fältMap[fält].belopp += belopp;
  };

  for (const rad of rows) {
    const { kontonummer, debet, kredit } = rad;

    const netto = kredit - debet;

    // Fält 05 – Momspliktig försäljning (30xx, 31xx)
    if (/^30\d\d$/.test(kontonummer) || /^31\d\d$/.test(kontonummer)) {
      add("05", "Momspliktig försäljning", netto);
    }

    // Fält 10–12 – Utgående moms
    if (["2611", "2612", "2613"].includes(kontonummer)) add("10", "Utgående moms 25%", kredit);
    if (["2620", "2621", "2622", "2623"].includes(kontonummer))
      add("11", "Utgående moms 12%", kredit);
    if (["2630", "2631", "2632", "2633"].includes(kontonummer))
      add("12", "Utgående moms 6%", kredit);

    // Fält 20–22 – Omvänd moms på inköp från EU och utland
    if (["4515", "4516", "4517"].includes(kontonummer))
      add("20", "Inköp varor från annat EU-land", debet);
    if (["4535", "4536", "4537"].includes(kontonummer))
      add("21", "Inköp tjänster från EU-land", debet);
    if (["4531", "4532", "4533"].includes(kontonummer))
      add("22", "Inköp tjänster från land utanför EU", debet);

    // Fält 23–24 – Omvänd moms i Sverige
    if (["4545", "4546", "4547"].includes(kontonummer))
      add("23", "Inköp varor i Sverige (omvänd moms)", debet);
    if (["4425", "213", "214"].includes(kontonummer))
      add("24", "Inköp tjänster i Sverige (omvänd moms)", debet);

    // Fält 30–32 – Utgående moms på omvänd moms
    if (["2614", "2615", "211"].includes(kontonummer))
      add("30", "Utgående moms 25% (omvänd moms)", kredit);
    if (["2624", "2625", "146"].includes(kontonummer))
      add("31", "Utgående moms 12% (omvänd moms)", kredit);
    if (["2634", "2635", "154"].includes(kontonummer))
      add("32", "Utgående moms 6% (omvänd moms)", kredit);

    // Fält 35 – Försäljning varor till annat EU-land
    if (["3108", "194"].includes(kontonummer)) add("35", "Varuförsäljning till EU-land", netto);

    // Fält 36 – Export av varor utanför EU
    if (["252"].includes(kontonummer)) add("36", "Export varor utanför EU", netto);

    // Fält 39 – Tjänster till EU kund (huvudregel)
    if (["192"].includes(kontonummer)) add("39", "Tjänst till EU (huvudregel)", netto);

    // Fält 40 – Tjänster till utanför EU
    if (["191"].includes(kontonummer)) add("40", "Tjänst till utanför EU", netto);

    // Fält 41 – Försäljning med omvänd moms
    if (["3300", "3305"].includes(kontonummer)) add("41", "Försäljning med omvänd moms", netto);

    // Fält 48 – Ingående moms
    if (["2640", "210", "248", "250", "251"].includes(kontonummer))
      add("48", "Ingående moms att dra av", debet);

    // Fält 50 – Beskattningsunderlag vid import
    if (["243"].includes(kontonummer)) add("50", "Beskattningsunderlag vid import", debet);

    // Fält 60–62 – Utgående moms vid import
    if (["2615"].includes(kontonummer)) add("60", "Utgående moms 25% (import)", kredit);
    if (["2625"].includes(kontonummer)) add("61", "Utgående moms 12% (import)", kredit);
    if (["2635"].includes(kontonummer)) add("62", "Utgående moms 6% (import)", kredit);
  }

  // Fält 49 – Moms att betala eller få tillbaka
  const sumFält = (...fält: string[]) =>
    fält.reduce((sum, f) => sum + (fältMap[f]?.belopp ?? 0), 0);
  const utgående = sumFält("10", "11", "12", "30", "31", "32", "60", "61", "62");
  const ingående = fältMap["48"]?.belopp ?? 0;
  const moms49 = utgående - ingående;
  fältMap["49"] = { fält: "49", beskrivning: "Moms att betala eller få tillbaka", belopp: moms49 };

  return Object.values(fältMap).filter((rad) => rad.belopp !== 0);
}
