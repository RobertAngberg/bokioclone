"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchTransaktioner(fromYear: string | null) {
  try {
    const client = await pool.connect();
    const parsedYear = parseInt(fromYear || "");

    const result = await client.query(
      `
      SELECT * FROM transaktioner
      WHERE EXTRACT(YEAR FROM transaktionsdatum) >= $1
      ORDER BY transaktionsdatum DESC
      `,
      [parsedYear]
    );

    client.release();
    return { success: true, data: result.rows };
  } catch (err: any) {
    console.error("❌ fetchTransaktioner error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchTransactionDetails(transaktionsId: number) {
  try {
    console.log(`🔍 Hämtar detaljer för transaktion ${transaktionsId}`);

    const result = await pool.query(
      `
      SELECT 
        tp.id AS transaktionspost_id,
        k.kontonummer,
        k.beskrivning,
        tp.debet,
        tp.kredit
      FROM transaktionsposter tp
      LEFT JOIN konton k ON tp.konto_id = k.id
      WHERE tp.transaktions_id = $1
      ORDER BY tp.id ASC
    `,
      [transaktionsId]
    );

    console.log(`✅ Hittade ${result.rows.length} poster`);
    return result.rows.map((d) => ({
      transaktionspost_id: d.transaktionspost_id,
      kontonummer: d.kontonummer,
      beskrivning: d.beskrivning,
      debet: d.debet,
      kredit: d.kredit,
    }));
  } catch (err: any) {
    console.error("❌ fetchTransactionDetails error:", err);
    return [];
  }
}

export async function exporteraTransaktionerMedPoster(year: string) {
  try {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const { rows } = await pool.query(
      `
      SELECT 
        t.id AS transaktions_id,
        t.transaktionsdatum,
        t.kontobeskrivning,
        t.belopp,
        t.kommentar,
        t.fil,
        tp.id AS transaktionspost_id,
        tp.debet,
        tp.kredit,
        k.kontonummer,
        k.beskrivning AS kontobeskrivning
      FROM transaktioner t
      LEFT JOIN transaktionsposter tp ON tp.transaktions_id = t.id
      LEFT JOIN konton k ON tp.konto_id = k.id
      WHERE t.transaktionsdatum BETWEEN $1 AND $2
      ORDER BY t.transaktionsdatum DESC, t.id DESC, tp.id ASC
    `,
      [start, end]
    );

    const map = new Map<number, any>();

    for (const row of rows) {
      if (!map.has(row.transaktions_id)) {
        map.set(row.transaktions_id, {
          transaktions_id: row.transaktions_id,
          transaktionsdatum: row.transaktionsdatum,
          kontobeskrivning: row.kontobeskrivning,
          belopp: row.belopp,
          kommentar: row.kommentar,
          fil: row.fil,
          transaktionsposter: [],
        });
      }

      if (row.transaktionspost_id) {
        map.get(row.transaktions_id).transaktionsposter.push({
          transaktionspost_id: row.transaktionspost_id,
          kontonummer: row.kontonummer,
          beskrivning: row.kontobeskrivning,
          debet: row.debet,
          kredit: row.kredit,
        });
      }
    }

    const resultat = Array.from(map.values());
    console.log(`📦 Exporterar ${resultat.length} transaktioner med poster`);
    return resultat;
  } catch (err: any) {
    console.error("❌ exporteraTransaktionerMedPoster error:", err);
    return [];
  }
}
