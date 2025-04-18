"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchTransaktioner(year: string | null) {
  try {
    const client = await pool.connect();
    const parsedYear = parseInt(year || "");

    const query = `
      SELECT * FROM transaktioner
      WHERE EXTRACT(YEAR FROM transaktionsdatum) = $1
      ORDER BY transaktionsdatum DESC
    `;
    const values = [parsedYear];

    console.log("🔍 Fetching transaktioner for year:", parsedYear);
    const result = await client.query(query, values);
    client.release();

    console.log("📦 Antal rader:", result.rows.length);

    return { success: true, data: result.rows };
  } catch (err: any) {
    console.error("❌ fetchTransaktioner error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchTransactionDetails(transaktionsId: number) {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        tp.transaktionspost_id, 
        k.kontonummer, 
        k.beskrivning,
        tp.debet, 
        tp.kredit
      FROM transaktionsposter tp
      LEFT JOIN konton k ON tp.konto_id = k.id
      WHERE tp.transaktions_id = $1
      ORDER BY tp.transaktionspost_id ASC
    `;

    const result = await client.query(query, [transaktionsId]);
    client.release();

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
