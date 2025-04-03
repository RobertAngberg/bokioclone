"use server";

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function fetchHuvudbok() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        k.kontonummer,
        k.kontobeskrivning,
        t.transaktionsdatum,
        t.fil,
        p.debet,
        p.kredit
      FROM transaktionsposter p
      JOIN konton k ON p.konto_id = k.konto_id
      JOIN transaktioner t ON p.transaktions_id = t.transaktions_id
      ORDER BY k.konto_id ASC, t.transaktionsdatum ASC
    `;

    const res = await client.query(query);
    client.release();

    return res.rows.map((row) => ({
      kontonummer: row.kontonummer,
      kontobeskrivning: row.kontobeskrivning,
      transaktionsdatum: row.transaktionsdatum?.toISOString?.() ?? "",
      fil: row.fil ?? "",
      debet: row.debet,
      kredit: row.kredit,
    }));
  } catch (error) {
    console.error("❌ fetchHuvudbok error:", error);
    return [];
  }
}
