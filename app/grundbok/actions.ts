"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchTransaktioner(year: string | null) {
  try {
    const client = await pool.connect();
    const parsedYear = parseInt(year || "");

    const query = year
      ? `SELECT * FROM transaktioner 
         WHERE transaktionsdatum >= $1 AND transaktionsdatum <= $2 
         ORDER BY transaktionsdatum DESC`
      : `SELECT * FROM transaktioner ORDER BY transaktionsdatum DESC`;

    const values = year
      ? [
          new Date(`${parsedYear}-01-01T00:00:00.000Z`),
          new Date(`${parsedYear}-12-31T23:59:59.999Z`),
        ]
      : [];

    const result = await client.query(query, values);
    client.release();

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
        k.kontobeskrivning, 
        tp.debet, 
        tp.kredit
      FROM transaktionsposter tp
      LEFT JOIN konton k ON tp.konto_id = k.konto_id
      WHERE tp.transaktions_id = $1
      ORDER BY tp.transaktionspost_id ASC
    `;

    const result = await client.query(query, [transaktionsId]);
    client.release();

    return result.rows.map((d) => ({
      transaktionspost_id: d.transaktionspost_id,
      kontobeskrivning: d.kontobeskrivning ?? "",
      debet: d.debet,
      kredit: d.kredit,
    }));
  } catch (err: any) {
    console.error("❌ fetchTransactionDetails error:", err);
    return [];
  }
}
