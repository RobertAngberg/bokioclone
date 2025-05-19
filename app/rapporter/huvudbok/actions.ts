"use server";

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function fetchHuvudbok() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        k.kontonummer,
        k.beskrivning AS kontonamn,
        t.transaktionsdatum,
        t.fil,
        p.debet,
        p.kredit
      FROM transaktionsposter p
      JOIN konton k ON p.konto_id = k.id
      JOIN transaktioner t ON p.transaktions_id = t.id
      ORDER BY k.kontonummer, t.transaktionsdatum
    `;

    const res = await client.query(query);
    client.release();

    console.log("✅ Antal rader hämtade från DB:", res.rowCount);
    res.rows.forEach((row, i) => {
      console.log(`🔹 Rad ${i + 1}:`, {
        kontonummer: row.kontonummer,
        kontonamn: row.kontonamn,
        datum: row.transaktionsdatum,
        debet: row.debet,
        kredit: row.kredit,
      });
    });

    return res.rows.map((row) => ({
      kontonummer: row.kontonummer,
      beskrivning: row.kontonamn,
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

export async function fetchFöretagsprofil(userId: number) {
  try {
    const client = await pool.connect();
    const query = `
      SELECT företagsnamn, organisationsnummer
      FROM företagsprofil
      WHERE id = $1
      LIMIT 1
    `;
    const res = await client.query(query, [userId]);
    client.release();
    return res.rows[0] || null;
  } catch (error) {
    console.error("❌ fetchFöretagsprofil error:", error);
    return null;
  }
}
