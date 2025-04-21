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
      k.kontoklass
    FROM transaktioner t
    JOIN transaktionsposter tp ON tp.transaktions_id = t.id
    JOIN konton k ON k.id = tp.konto_id
    WHERE t."userId" = $1
    ORDER BY år DESC, k.kontonummer::int
    `,
    [userId]
  );

  const rows = result.rows;
  console.log("📦 Alla rader:", rows.length, "exempel:", rows[0]);

  const årsSet = new Set<string>();
  const intakterMap = new Map<string, any>(); // gruppnamn -> konton
  const kostnaderMap = new Map<string, any>();

  for (const row of rows) {
    const år = String(row.år);
    årsSet.add(år);

    const { kontonummer, beskrivning, kontoklass, debet, kredit } = row;
    const belopp = debet - kredit; // netto

    const isIntakt = kontonummer.startsWith("3");
    const isKostnad = /^[4-8]/.test(kontonummer);

    const grupp = getGruppNamn(kontonummer, kontoklass, isIntakt);

    const map = isIntakt ? intakterMap : isKostnad ? kostnaderMap : null;
    if (!map) continue;

    if (!map.has(grupp)) {
      map.set(grupp, new Map()); // kontonummer -> { belopp per år }
    }

    const kontoMap = map.get(grupp);
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

  const intakter = formatData(intakterMap);
  const kostnader = formatData(kostnaderMap);

  const resultat = { ar: years, intakter, kostnader };

  console.log("✅ Returnerar resultatrapport:");
  console.log(JSON.stringify(resultat, null, 2));

  return resultat;
}

// 🧠 Gruppnamn baserat på kontonummer
function getGruppNamn(kontonummer: string, kontoklass: string, isIntakt: boolean): string {
  if (isIntakt) return "Nettoomsättning";

  if (/^4/.test(kontonummer)) return "Varukostnader";
  if (/^5/.test(kontonummer)) return "Förbrukningsinventarier och material";
  if (/^6/.test(kontonummer)) return "Försäljningskostnader";
  if (/^7/.test(kontonummer)) return "Administrationskostnader";

  return kontoklass || "Övrigt";
}
