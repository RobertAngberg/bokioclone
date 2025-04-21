"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchTransaktioner(year: string | null) {
  try {
    const client = await pool.connect();
    const parsedYear = parseInt(year || "");

    console.log("🔍 fetchTransaktioner start:");
    console.log("📆 År som tolkades:", parsedYear);

    const query = `
      SELECT * FROM transaktioner
      WHERE EXTRACT(YEAR FROM transaktionsdatum) = $1
      ORDER BY transaktionsdatum DESC
    `;
    const values = [parsedYear];

    console.log("📤 Skickar SQL-fråga...");
    const result = await client.query(query, values);
    console.log("✅ SQL-fråga klar. Rader hämtade:", result.rows.length);
    client.release();

    if (result.rows.length > 0) {
      console.log("🔎 Exempel på första raden:", result.rows[0]);
    } else {
      console.log("⚠️ Inga transaktioner hittades för detta år.");
    }

    return { success: true, data: result.rows };
  } catch (err: any) {
    console.error("❌ fetchTransaktioner error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchTransactionDetails(transaktionsId: number) {
  try {
    console.log(`🔍 fetchTransactionDetails start: transaktionsId = ${transaktionsId}`);

    const client = await pool.connect();

    const query = `
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
    `;

    console.log("📤 Skickar SQL-fråga för detaljer...");
    const result = await client.query(query, [transaktionsId]);
    client.release();

    console.log(`✅ Fick ${result.rows.length} poster för transaktionsId ${transaktionsId}`);
    if (result.rows.length > 0) {
      console.log("🔎 Exempel post:", result.rows[0]);
    }

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
