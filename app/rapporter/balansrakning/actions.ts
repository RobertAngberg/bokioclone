"use server";

import { Pool } from "pg";
import { auth } from "@/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchBalansData(year: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  console.log("🟡 Hämtar balansdata för:", { userId, start, end });

  // TILLGÅNGAR (konton som börjar med 1)
  const tillgangarRes = await pool.query(
    `SELECT k.kontonummer, k.beskrivning, 
            SUM(COALESCE(tp.debet, 0) - COALESCE(tp.kredit, 0)) AS saldo
     FROM transaktionsposter tp
     JOIN konton k ON k.id = tp.konto_id
     JOIN transaktioner t ON t.id = tp.transaktions_id
     WHERE t."userId" = $1
       AND t.transaktionsdatum BETWEEN $2 AND $3
       AND k.kontonummer LIKE '1%'
     GROUP BY k.kontonummer, k.beskrivning
     ORDER BY k.kontonummer`,
    [userId, start, end]
  );

  // SKULDER & EGET KAPITAL (konton som börjar med 2 eller 3)
  const skulderRes = await pool.query(
    `SELECT k.kontonummer, k.beskrivning, 
            SUM(COALESCE(tp.kredit, 0) - COALESCE(tp.debet, 0)) AS saldo
     FROM transaktionsposter tp
     JOIN konton k ON k.id = tp.konto_id
     JOIN transaktioner t ON t.id = tp.transaktions_id
     WHERE t."userId" = $1
       AND t.transaktionsdatum BETWEEN $2 AND $3
       AND k.kontonummer ~ '^[23]'
     GROUP BY k.kontonummer, k.beskrivning
     ORDER BY k.kontonummer`,
    [userId, start, end]
  );

  const tillgangar = tillgangarRes.rows.map((row) => ({
    kontonummer: row.kontonummer,
    beskrivning: row.beskrivning,
    saldo: parseFloat(row.saldo),
  }));

  const skulderOchEgetKapital = skulderRes.rows.map((row) => ({
    kontonummer: row.kontonummer,
    beskrivning: row.beskrivning,
    saldo: parseFloat(row.saldo),
  }));

  const sumTillgangar = tillgangar.reduce((acc, row) => acc + row.saldo, 0);
  const sumSkulder = skulderOchEgetKapital.reduce((acc, row) => acc + row.saldo, 0);
  const differens = sumTillgangar - sumSkulder;

  console.log("🟢 Tillgångar:", tillgangar);
  console.log("🟢 Skulder/EK:", skulderOchEgetKapital);
  console.log("⚖️ Differens:", differens);

  return {
    year,
    tillgangar,
    skulderOchEgetKapital,
    differens,
  };
}
