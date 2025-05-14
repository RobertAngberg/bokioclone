"use server";

import { Pool } from "pg";
import { auth } from "@/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function hamtaResultatrapport() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = session.user.id;

  const result = await pool.query(
    `
    SELECT
      t.id AS transaktion_id,
      t.transaktionsdatum,
      EXTRACT(YEAR FROM t.transaktionsdatum) AS år,
      tp.debet,
      tp.kredit,
      k.kontonummer,
      k.beskrivning,
      k.kontoklass,
      k.kategori
    FROM transaktioner t
    JOIN transaktionsposter tp ON tp.transaktions_id = t.id
    JOIN konton k ON k.id = tp.konto_id
    WHERE t."userId" = $1
    ORDER BY år DESC, k.kontonummer::int
    `,
    [userId]
  );

  const rows = result.rows;

  const årsSet = new Set<string>();
  const intakterMap = new Map<string, Map<string, any>>();
  const rorelsensMap = new Map<string, Map<string, any>>();
  const finansiellaMap = new Map<string, Map<string, any>>();

  for (const row of rows) {
    const år = String(row.år);
    årsSet.add(år);

    const { kontonummer, beskrivning, kontoklass, kategori, debet, kredit } = row;
    const belopp = debet - kredit;

    let målMap: Map<string, Map<string, any>> | null = null;
    let grupp = kategori || "Övrigt"; // Gruppnamn = kategori

    if (/^3/.test(kontonummer)) {
      målMap = intakterMap;
    } else if (/^[4-7]/.test(kontonummer)) {
      målMap = rorelsensMap;
    } else if (/^8/.test(kontonummer)) {
      målMap = finansiellaMap;
    }

    if (!målMap) continue;

    if (!målMap.has(grupp)) målMap.set(grupp, new Map());
    const kontoMap = målMap.get(grupp)!;

    if (!kontoMap.has(kontonummer)) {
      kontoMap.set(kontonummer, {
        kontonummer,
        beskrivning,
        [år]: belopp,
      });
    } else {
      kontoMap.get(kontonummer)[år] = (kontoMap.get(kontonummer)[år] || 0) + belopp;
    }
  }

  const years = Array.from(årsSet).sort((a, b) => b.localeCompare(a));

  const formatData = (map: Map<string, Map<string, any>>) =>
    Array.from(map.entries()).map(([namn, kontoMap]) => {
      const konton = Array.from(kontoMap.values());
      const summering: { [år: string]: number } = {};
      for (const konto of konton) {
        for (const år of years) {
          summering[år] = (summering[år] || 0) + (konto[år] || 0);
        }
      }
      return { namn, konton, summering };
    });

  return {
    ar: years,
    intakter: formatData(intakterMap),
    rorelsensKostnader: formatData(rorelsensMap),
    finansiellaKostnader: formatData(finansiellaMap),
  };
}
